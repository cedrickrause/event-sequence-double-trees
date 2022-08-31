/* eslint-disable class-methods-use-this */
import { CategoricalVariable } from '@/models/CategoricalVariable';
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import { NumericalVariable } from '@/models/NumericalVariable';
import * as d3 from 'd3';
import { BaseTransformer } from './BaseTransformer';

export interface StatsbombEventTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type StatsbombEvent = {
  id: string,
  period: string,
  minute: number,
  second: number,
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
  shot: {
    outcome: {
      id: number,
      name: string,
    }
  },
  pass: {
    type: {
      id: number,
      name: string,
    }
    cross: boolean,
  }
}

export enum StatsbombVariableNames {
  HALF_TIME = 'Half Time',
  TEAM = 'Team',
  PLAYER = 'Player',
  POSITION = 'Position',
  MINUTE = 'Minute',
  DURATION = 'Duration',
}

export class StatsbombEventTransformerImpl implements StatsbombEventTransformer {
  static instance = new StatsbombEventTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.json<Array<StatsbombEvent>>(filename).then((parsedData) => {
      if (parsedData) {
        const eventDatasetEntries: EventDatasetEntry[] = parsedData.map(
          (event) => {
            let eventType = event.type.name;
            if (eventType === 'Shot' && event.shot.outcome.name === 'Goal') {
              eventType = 'Goal';
            }
            if (eventType === 'Pass') {
              if (event.pass.type && (event.pass.type.name === 'Corner' || event.pass.type.name === 'Free Kick')) {
                eventType = 'Set Piece';
              } else if (event.pass.cross) {
                eventType = 'Cross';
              }
            }
            const minuteToSecond = event.minute ? event.minute * 60 : 0;
            const second = event.second ? event.second : 0;
            return {
              id: event.id,
              eventType,
              sequence: `possession: ${event.possession.toString()}`,
              time: minuteToSecond + second,
              variables: [
                new CategoricalVariable(StatsbombVariableNames.HALF_TIME, event.period),
                new CategoricalVariable(StatsbombVariableNames.TEAM, event.team?.name),
                new CategoricalVariable(StatsbombVariableNames.PLAYER, event.player?.name),
                new CategoricalVariable(StatsbombVariableNames.POSITION, event.position?.name),
                new NumericalVariable(StatsbombVariableNames.MINUTE, event.minute),
                new NumericalVariable(StatsbombVariableNames.DURATION, event.duration),
              ],
            };
          },

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
