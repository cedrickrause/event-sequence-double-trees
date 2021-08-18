import { EventSequenceDataset } from '@/models/EventSequenceDataset';

export default (
  eventSequenceDataset: EventSequenceDataset,
  query: string[],
): EventSequenceDataset => {
  const filteredEventSequences = eventSequenceDataset.data.filter(
    (sequence) => {
      let subQuery = [...query];
      let subSequence = sequence.events;
      while (subQuery.length > 0) {
        const indexOfEventType = subSequence.findIndex(
          // eslint-disable-next-line no-loop-func
          (event) => event.eventType === subQuery[0],
        );
        if (indexOfEventType > -1) {
          subQuery = subQuery.slice(1);
          subSequence = subSequence.slice(indexOfEventType);
        } else {
          return false;
        }
      }
      return true;
    },
  );

  return {
    data: filteredEventSequences,
  };
};
