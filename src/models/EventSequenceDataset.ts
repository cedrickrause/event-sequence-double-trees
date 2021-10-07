import { BaseDataset } from './BaseDataset';
import { EventDatasetEntry } from './EventDataset';
import { Variable } from './Variable';

export type EventSequence = {
  id: number,
  events: Array<EventDatasetEntry>
  variables: Variable[],
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
