import { BaseDataset } from './BaseDataset';
import { EventDatasetEntry } from './EventDataset';

export type EventSequence = {
  id: string,
  events: Array<EventDatasetEntry>
};

export interface EventSequenceDataset extends BaseDataset {
  data: Array<EventSequence>,

  addEndOfSequenceEvents(): EventSequenceDataset,

  addStartOfSequenceEvents(): EventSequenceDataset,
}

export class EventSequenceDatasetImpl implements EventSequenceDataset {
  data: Array<EventSequence>;

  constructor(data: Array<EventSequence>) {
    this.data = data;
  }

  addEndOfSequenceEvents(): EventSequenceDataset {
    this.data.forEach((sequence) => {
      sequence.events.push({
        id: '0',
        eventType: 'End',
        sequence: sequence.id,
        variables: [],
      });
    });
    return this;
  }

  addStartOfSequenceEvents(): EventSequenceDataset {
    this.data.forEach((sequence) => {
      sequence.events.unshift({
        id: '-1',
        eventType: 'Start',
        sequence: sequence.id,
        variables: [],
      });
    });
    return this;
  }
}
