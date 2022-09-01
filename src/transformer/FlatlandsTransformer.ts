/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { CategoricalVariable } from '@/models/CategoricalVariable';
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import { NumericalVariable } from '@/models/NumericalVariable';
import * as d3 from 'd3';
import { BaseTransformer } from './BaseTransformer';

export interface FlatlandsEventTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type FlatlandsLink = {
  source: string,
  target: {
    id: string
  },
  value: number,
  trains: number[],
  timestep_train: {
    [timestep: string]: number[]
  }
}

type FlatlandsModel = {
  links: FlatlandsLink[],
  nodes: {
    [region: string]: {
      id: number,
      trains: {
        [trainNumber: string]: {
          timesteps: number[]
        }
      }
    }
  },
}

type FlatlandsDataset = {
  [model: string]: FlatlandsModel,
}

export enum FlatlandsVariableNames {
  MODEL = 'Model',
  TIMESTEP = 'Timestep',
  DEADLOCKED = 'Deadlocked',
  FINISHED = 'Finished',
}

export class FlatlandsEventTransformerImpl implements FlatlandsEventTransformer {
  static instance = new FlatlandsEventTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.json<FlatlandsDataset>(filename).then((parsedData) => {
      if (parsedData) {
        const eventDatasetEntries: EventDatasetEntry[] = [];
        Object.keys(parsedData).forEach(
          (modelName: string) => {
            const model = parsedData[modelName];
            const { nodes, links } = model;
            links.forEach((link) => {
              link.trains.forEach((train) => {
                const timesteps = Object.keys(link.timestep_train)
                  .filter((timestep) => link.timestep_train[timestep].includes(train));
                // console.log(timesteps);
                timesteps.forEach((timestep: string) => {
                  eventDatasetEntries.push({
                    id: `${modelName}${train}:${timestep}`,
                    eventType: `Region ${link.target.id.toString()}`,
                    sequence: `${modelName} - train: ${train}`,
                    time: +timestep,
                    variables: [
                      new CategoricalVariable(FlatlandsVariableNames.MODEL, modelName),
                      new NumericalVariable(FlatlandsVariableNames.TIMESTEP, +timestep),
                    ],
                  });
                });
              });
            });
            const trainEarliestRegion = {} as {
              [trainNumber: string]: {
                region: string,
                timestep: number,
              }
            };
            Object.keys(nodes).forEach((region) => {
              const node = nodes[region];
              Object.keys(node.trains).forEach((trainNumber) => {
                const trainNodeData = node.trains[trainNumber];
                const earliestTimestepInRegion = trainNodeData.timesteps[0];
                if (!trainEarliestRegion[trainNumber]) {
                  trainEarliestRegion[trainNumber] = {
                    region,
                    timestep: earliestTimestepInRegion,
                  };
                } else if (trainEarliestRegion[trainNumber].timestep > earliestTimestepInRegion) {
                  trainEarliestRegion[trainNumber].region = region;
                  trainEarliestRegion[trainNumber].timestep = earliestTimestepInRegion;
                }
              });
            });
            Object.keys(trainEarliestRegion).forEach((trainNumber) => {
              const { region, timestep } = trainEarliestRegion[trainNumber];
              eventDatasetEntries.push({
                id: `${modelName}${trainNumber}:${timestep}`,
                eventType: `Region ${region}`,
                sequence: `${modelName} - train: ${trainNumber}`,
                time: +timestep,
                variables: [
                  new CategoricalVariable(FlatlandsVariableNames.MODEL, modelName),
                  new NumericalVariable(FlatlandsVariableNames.TIMESTEP, +timestep),
                ],
              });
            });
          },
        );
        const sortedEventDatasetEntries = eventDatasetEntries
          .sort((a, b) => (+a.id.substring(a.id.indexOf(':') + 1) > +b.id.substring(b.id.indexOf(':') + 1)
            ? 1 : -1));
        return new EventDatasetImpl(
          sortedEventDatasetEntries,
        );
      }
      return undefined;
    });

    return eventDataset;
  }
}
