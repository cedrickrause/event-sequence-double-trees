import { compressEventSequences, removeEventsWithUnusedTypes } from '@/helpers/eventFiltering';
import getUniqueComparisonVariableValues from '@/helpers/comparisonValues';
import applyQueryToEventSequenceDataset from '@/helpers/eventSequenceFiltering';
import { nodeMinimumSize, nodeMaximumSize } from '@/helpers/config';
import { EventDataset, EventDatasetEntry } from '@/models/EventDataset';
import { EventSequenceDataset, EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { StatsbombEventTransformerImpl } from '@/transformer/StatsbombEventTransformer';
import { schemeCategory10 } from 'd3-scale-chromatic';
import _ from 'lodash';
import { ActionTree } from 'vuex';
import { scaleSqrt } from 'd3-scale';
import { NobelCsvTransformerImpl } from '@/transformer/NobelCsvTransformer';
import { Getters } from './getters';
import { Mutations } from './mutations';
import { RootState } from './RootState';

export enum Actions {
  LOAD_EVENT_DATA = 'loadEventData',
  LOAD_NOBEL_EVENT_DATA = 'loadNobelEventData',
  SELECT_COMPARISON_VARIABLE = 'selectComparisonVariable',
  FILTER_EVENT_SEQUENCE_WITH_QUERY = 'filterEventSequenceWithQuery',
  RESET_EVENT_SEQUENCE_DATA = 'resetEventSequenceData',
}

export const actions: ActionTree<RootState, RootState> = {
  async [Actions.LOAD_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await StatsbombEventTransformerImpl.instance.transform(payload);
    const filteredEventData = removeEventsWithUnusedTypes(eventData);
    context.commit(Mutations.SET_EVENT_DATA, filteredEventData);
    context.commit(Mutations.SET_VARIABLE_COUNT, filteredEventData?.data[0].variables.length);

    const groupedEventArrays = Object.values(_.groupBy(filteredEventData?.data, 'sequence'));
    const eventSequenceData = new EventSequenceDatasetImpl(
      groupedEventArrays.map((sequence) => ({
        id: sequence[0].sequence,
        events: sequence,
      })),
    );
    const maximumNumberOfSequencesWithSameEventType = Math.max(
      ..._.uniq(filteredEventData?.data.map((event) => event.eventType)).map(
        (eventType) => eventSequenceData.data.filter(
          (sequence) => sequence.events.map((event) => event.eventType).indexOf(eventType) !== -1,
        ),
      ).map((sequencesWithEventType) => sequencesWithEventType.length),
    );
    const nodeScale = scaleSqrt()
      .domain([1, maximumNumberOfSequencesWithSameEventType])
      .range([nodeMinimumSize, nodeMaximumSize]);

    context.commit(Mutations.SET_NODE_SCALE,
      nodeScale);
    eventSequenceData.addEndOfSequenceEvents();
    eventSequenceData.addStartOfSequenceEvents();
    const compressedEventSequenceData = compressEventSequences(eventSequenceData);
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, compressedEventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, compressedEventSequenceData);
  },

  async [Actions.LOAD_NOBEL_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await NobelCsvTransformerImpl.instance.transform(payload);
    context.commit(Mutations.SET_EVENT_DATA, eventData);
    context.commit(Mutations.SET_VARIABLE_COUNT, eventData?.data[0].variables.length);

    const groupedEventArrays = Object.values(_.groupBy(eventData?.data, 'sequence'));
    const eventSequenceData = new EventSequenceDatasetImpl(
      groupedEventArrays.map((sequence) => ({
        id: sequence[0].sequence,
        events: sequence,
      })),
    );
    const maximumNumberOfSequencesWithSameEventType = Math.max(
      ..._.uniq(eventData?.data.map((event) => event.eventType)).map(
        (eventType) => eventSequenceData.data.filter(
          (sequence) => sequence.events.map((event) => event.eventType).indexOf(eventType) !== -1,
        ),
      ).map((sequencesWithEventType) => sequencesWithEventType.length),
    );
    const nodeScale = scaleSqrt()
      .domain([1, maximumNumberOfSequencesWithSameEventType])
      .range([nodeMinimumSize, nodeMaximumSize]);

    context.commit(Mutations.SET_NODE_SCALE,
      nodeScale);
    eventSequenceData.addEndOfSequenceEvents();
    eventSequenceData.addStartOfSequenceEvents();
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, eventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, eventSequenceData);
  },

  [Actions.SELECT_COMPARISON_VARIABLE](context, payload: Variable): void {
    const eventDataset: EventDataset = context.getters[Getters.GET_EVENT_DATA];
    const comparisonVariableValues = getUniqueComparisonVariableValues(
      eventDataset,
      payload?.name,
      context.getters[Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD],
    );
    const basicColorScheme = schemeCategory10;
    const colorScheme = _.reduce(comparisonVariableValues,
      (accumulator, value, index) => Object.assign(accumulator, {
        [value]: basicColorScheme[index],
      }), {});
    context.commit(Mutations.SET_COMPARISON_VARIABLE, payload);
    context.commit(Mutations.SET_COLOR_SCHEME, colorScheme);
    context.commit(Mutations.SET_COMPARISON_VARIABLE_VALUES, comparisonVariableValues);

    const maxComparisonVariableValue = _.max(eventDataset.data
      .map((event: EventDatasetEntry) => event.variables
        .filter((variable) => variable.name === payload?.name)
        .map((variable) => variable.value))
      .flat());
    context.commit(Mutations.SET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM, maxComparisonVariableValue);
  },

  [Actions.FILTER_EVENT_SEQUENCE_WITH_QUERY](context, payload): void {
    const originalEventSequenceData: EventSequenceDataset = context
      .getters[Getters.GET_EVENT_SEQUENCE_DATA];

    context.commit(
      Mutations.SET_EVENT_SEQUENCE_DATA,
      applyQueryToEventSequenceDataset(originalEventSequenceData, payload),
    );
  },

  [Actions.RESET_EVENT_SEQUENCE_DATA](context): void {
    const initialEventSequenceData = context.getters[Getters.GET_INITIAL_EVENT_SEQUENCE_DATA];
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, initialEventSequenceData);
  },
};
