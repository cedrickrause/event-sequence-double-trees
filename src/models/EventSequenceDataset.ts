import { BaseDataset } from './BaseDataset';
import { EventDatasetEntry } from './EventDataset';

export type EventSequenceDatasetEntry = {
  events: Array<EventDatasetEntry>
};

export interface EventSequenceDataset extends BaseDataset {
  data: Array<EventSequenceDatasetEntry>,
}

export class EventSequenceDatasetImpl implements EventSequenceDataset {
  data: Array<EventSequenceDatasetEntry>;

  constructor(data: Array<EventSequenceDatasetEntry>) {
    this.data = data;
  }
}
