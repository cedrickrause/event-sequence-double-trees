/* eslint-disable class-methods-use-this */
import { CategoricalVariable } from '@/models/CategoricalVariable';
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import { EventSequenceDataset, EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import { EventLocation } from '@/models/LocationVariable';
import { NumericalVariable } from '@/models/NumericalVariable';
import * as d3 from 'd3';
import _ from 'lodash';
import { BaseTransformer } from './BaseTransformer';

export interface StatsbombEventTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type StatsbombEvent = {
  id: string,
  period: string,
  minute: number,
  type: {
    id: number,
    name: string,
  }
  possession: number,
  team: {
    id: number,
    name: string,
  },
  player: {
    id: number,
    name: string,
  },
  position: {
    id: number,
    name: string,
  }
  location: [number, number],
  duration: number,
}

export enum StatsbombVariableNames {
  HALF_TIME = 'Half Time',
  TEAM = 'Team',
  PLAYER = 'Player',
  POSITION = 'Position',
  MINUTE = 'Minute',
  DURATION = 'Duration',
  LOCATION = 'Location',
}

export class StatsbombEventTransformerImpl implements StatsbombEventTransformer {
  static instance = new StatsbombEventTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.json<Array<StatsbombEvent>>(filename).then((parsedData) => {
      if (parsedData) {
        const eventDatasetEntries: EventDatasetEntry[] = parsedData.map(
          (event) => ({
            id: event.id,
            eventType: event.type.name,
            sequence: event.possession,
            variables: [
              new CategoricalVariable(StatsbombVariableNames.HALF_TIME, event.period),
              new CategoricalVariable(StatsbombVariableNames.TEAM, event.team?.name),
              new CategoricalVariable(StatsbombVariableNames.PLAYER, event.player?.name),
              new CategoricalVariable(StatsbombVariableNames.POSITION, event.position?.name),
              new NumericalVariable(StatsbombVariableNames.MINUTE, event.minute),
              new NumericalVariable(StatsbombVariableNames.DURATION, event.duration),
              new EventLocation(StatsbombVariableNames.LOCATION, event.location),
            ],
          }),
        );
        return new EventDatasetImpl(
          eventDatasetEntries,
        );
      }
      return undefined;
    });

    return eventDataset;
  }

  createEventSequenceDatasetFromEventDataset(
    eventDataset: EventDataset | undefined,
  ): EventSequenceDataset {
    console.log(eventDataset);

    const groupedEventArrays = Object.values(_.groupBy(eventDataset?.data, 'sequence'));
    const eventSequenceData = new EventSequenceDatasetImpl(
      groupedEventArrays.map((sequence) => ({
        id: sequence[0].sequence,
        events: sequence,
        variables: [
          sequence[0].variables.find(
            (variable) => variable.name === StatsbombVariableNames.HALF_TIME,
          ) ?? new CategoricalVariable(StatsbombVariableNames.HALF_TIME, '-1'),
        ],
      })),
    );
    return eventSequenceData;
  }
}

function getVariableFromEvent(variableName: string, event: EventDatasetEntry) {
  const variableToFind = event.variables.find((variable) => variable.name === variableName);
  if (variableToFind) {
    return variableToFind;
  }
}
