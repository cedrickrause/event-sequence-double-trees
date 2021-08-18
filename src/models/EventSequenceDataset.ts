import { BaseDataset } from './BaseDataset';
import { EventDatasetEntry } from './EventDataset';

export type EventSequence = {
  id: number,
  events: Array<EventDatasetEntry>
};

export interface EventSequenceDataset extends BaseDataset {
  data: Array<EventSequence>,
}

export class EventSequenceDatasetImpl implements EventSequenceDataset {
  data: Array<EventSequence>;

  constructor(data: Array<EventSequence>) {
    this.data = data;
  }
}
