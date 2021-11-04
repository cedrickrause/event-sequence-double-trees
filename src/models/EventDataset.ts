import { BaseDataset } from './BaseDataset';
import { Variable } from './Variable';

export type EventDatasetEntry = {
  id: string,
  eventType: string,
  sequence: string,
  variables: Variable[],
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
