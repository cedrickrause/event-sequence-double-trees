/* eslint-disable class-methods-use-this */
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import {
  CategoricalVariable, NumericalVariable, Variable,
} from '@/models/Variable';
import * as d3 from 'd3';
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
              {
                name: StatsbombVariableNames.HALF_TIME,
                value: event.period,
              } as CategoricalVariable,
              {
                name: StatsbombVariableNames.TEAM,
                value: event.team.name,
              } as CategoricalVariable,
              {
                name: StatsbombVariableNames.PLAYER,
                value: event.player?.name,
              } as CategoricalVariable,
              {
                name: StatsbombVariableNames.POSITION,
                value: event.position?.name,
              } as CategoricalVariable,
              {
                name: StatsbombVariableNames.MINUTE,
                value: event.minute,
              } as NumericalVariable,
              {
                name: StatsbombVariableNames.DURATION,
                value: event.duration,
              } as NumericalVariable,
              {
                name: StatsbombVariableNames.LOCATION,
                value: event.location,
              } as Variable,
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
}
