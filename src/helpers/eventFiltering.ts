import { EventDataset, EventDatasetEntry } from '@/models/EventDataset';
import { EventSequence, EventSequenceDataset, EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import _ from 'lodash';

const removedEventTypes = ['Pressure', 'Ball Receipt*', 'Camera On', 'Camera off', 'Starting XI', 'Half Start', 'Half End',
  'Injury Stoppage', 'Foul Committed', 'Carry', 'Shield', 'Player On', 'Player Off', 'Dribbled Past', 'Error', 'Tactical Shift',
  'Referee Ball-Drop', 'Own Goal For', 'Substitution', 'Pass'];

const EVENT_TYPE_PASS = 'Pass';
const EVENT_TYPE_CARRY = 'Carry';

export const removeEventsWithUnusedTypes = (
  eventDataset: EventDataset | undefined,
): EventDataset | undefined => {
  if (!eventDataset) {
    return undefined;
  }
  return {
    data: eventDataset.data.filter(
      (event: EventDatasetEntry) => !removedEventTypes.includes(event.eventType),
    ),
  };
};

function eventsArePassOrCarry(event: EventDatasetEntry, predecessor: EventDatasetEntry) {
  return [EVENT_TYPE_PASS, EVENT_TYPE_CARRY].includes(event.eventType) && predecessor
  && [EVENT_TYPE_PASS, EVENT_TYPE_CARRY].includes(predecessor.eventType);
}

function compressPassAndCarryForSequence(sequence: EventSequence) {
  const filteredEventsForSequence = sequence.events.filter(
    (event: EventDatasetEntry, index: number, events: EventDatasetEntry[]) => {
      if (eventsArePassOrCarry(event, events[index - 1])) {
        return false;
      }
      return true;
    },
  );
  return {
    id: sequence.id,
    events: filteredEventsForSequence,
  };
}

export const compressEventSequences = (
  eventSequenceDataset: EventSequenceDataset | undefined,
): EventSequenceDataset | undefined => {
  if (!eventSequenceDataset) {
    return undefined;
  }
  return new EventSequenceDatasetImpl(
    eventSequenceDataset.data.map((sequence) => compressPassAndCarryForSequence(sequence)),
  );
};

export const getMaxNumberOfSequencesWithOneEventType = (
  eventData: EventDataset | undefined,
  eventSequenceData: EventSequenceDataset,
): number => Math.max(
  ..._.uniq(eventData?.data.map((event) => event.eventType)).map(
    (eventType) => eventSequenceData.data.filter(
      (sequence) => sequence.events.map((event) => event.eventType).indexOf(eventType) !== -1,
    ),
  ).map((sequencesWithEventType) => sequencesWithEventType.length),
);

export const getEventSequenceDataFromEventData = (
  eventData: EventDataset | undefined,
  sequenceId: string,
): EventSequenceDataset => {
  const groupedEventArrays = Object.values(_.groupBy(eventData?.data, sequenceId));
  return new EventSequenceDatasetImpl(
    groupedEventArrays.map((sequence) => ({
      id: sequence[0].sequence,
      events: sequence,
    })),
  );
};
