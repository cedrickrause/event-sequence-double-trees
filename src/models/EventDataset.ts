import { BaseDataset } from './BaseDataset';

export type EventDatasetEntry = {
  id: string,
  eventType: string,
  sequence: number,
};

export interface EventDataset extends BaseDataset {
  data: Array<EventDatasetEntry>,
}

export class EventDatasetImpl implements EventDataset {
  data: Array<EventDatasetEntry>;

  constructor(data: Array<EventDatasetEntry>) {
    this.data = data;
  }
}
