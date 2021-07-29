import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { EventTreeNode, EventTreeNodeImpl } from '@/models/EventTree';

const createEmptyRoot = (centralEventType: string): EventTreeNode => new EventTreeNodeImpl(
  centralEventType, 0, [], [],
);

export default (
  eventSequenceDataset: EventSequenceDataset,
  centralEventType: string,
): EventTreeNode => {
  const root = createEmptyRoot(centralEventType);
  eventSequenceDataset.data.forEach((sequence) => {
    const indexOfFirstOccurrence = sequence.events.findIndex(
      (event) => event.eventType === centralEventType,
    );
    if (indexOfFirstOccurrence >= 0) {
      root.value += 1;
      root.addEventSequenceToParents(sequence.events.slice(0, indexOfFirstOccurrence));
      root.addEventSequenceToChildren(sequence.events.slice(indexOfFirstOccurrence + 1));
    }
  });

  console.log(root);
  console.log(root.descendants());
  return root;
};
