/* eslint-disable class-methods-use-this */
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import * as d3 from 'd3';
import { BaseTransformer } from './BaseTransformer';

export interface StatsbombEventTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type StatsbombEvent = {
  id: string,
  type: {
    id: number,
    name: string,
  }
  possession: number,
}

export class StatsbombEventTransformerImpl implements StatsbombEventTransformer {
  static instance = new StatsbombEventTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.json<Array<StatsbombEvent>>(filename).then((parsedData) => {
      if (parsedData) {
        const eventDatasetEntries = parsedData.map(
          (event) => ({
            id: event.id,
            eventType: event.type.name,
            sequence: event.possession,
          }) as EventDatasetEntry,
        );
        return new EventDatasetImpl(eventDatasetEntries);
      }
      return undefined;
    });

    return eventDataset;
  }
}
