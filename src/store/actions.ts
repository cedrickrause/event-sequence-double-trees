import { compressEventSequences, removeEventsWithUnusedTypes } from '@/helpers/eventFiltering';
import getUniqueComparisonVariableValues from '@/helpers/comparisonValues';
import applyQueryToEventSequenceDataset from '@/helpers/eventSequenceFiltering';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset, EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import { StatsbombEventTransformerImpl } from '@/transformer/StatsbombEventTransformer';
import { schemeCategory10 } from 'd3-scale-chromatic';
import _ from 'lodash';
import { ActionTree } from 'vuex';
import { Getters } from './getters';
import { Mutations } from './mutations';
import { RootState } from './RootState';

export enum Actions {
  LOAD_EVENT_DATA = 'loadEventData',
  SELECT_ELEMENT = 'selectElement',
  SELECT_COMPARISON_VARIABLE = 'selectComparisonVariable',
  FILTER_EVENT_SEQUENCE_WITH_QUERY = 'filterEventSequenceWithQuery',
  RESET_EVENT_SEQUENCE_DATA = 'resetEventSequenceData',
}

export const actions: ActionTree<RootState, RootState> = {
  async [Actions.LOAD_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await StatsbombEventTransformerImpl.instance.transform(payload);
    const filteredEventData = removeEventsWithUnusedTypes(eventData);
    context.commit(Mutations.SET_EVENT_DATA, filteredEventData);

    const groupedEventArrays = Object.values(_.groupBy(filteredEventData?.data, 'sequence'));
    const eventSequenceData = new EventSequenceDatasetImpl(
      groupedEventArrays.map((sequence) => ({
        id: sequence[0].sequence,
        events: sequence,
      })),
    );
    const compressedEventSequenceData = compressEventSequences(eventSequenceData);
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, compressedEventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, compressedEventSequenceData);
  },

  [Actions.SELECT_ELEMENT](context, payload): void {
    if (context.getters[Getters.GET_SELECTED_ELEMENT_ID] !== payload) {
      context.commit(Mutations.SET_SELECTED_ELEMENT_ID, payload);
    } else {
      context.commit(Mutations.SET_SELECTED_ELEMENT_ID, null);
    }
  },

  [Actions.SELECT_COMPARISON_VARIABLE](context, payload): void {
    const eventDataset: EventDataset = context.getters[Getters.GET_EVENT_DATA];
    const comparisonVariableValues = getUniqueComparisonVariableValues(eventDataset, payload);
    const basicColorScheme = schemeCategory10;
    const colorScheme = _.reduce(comparisonVariableValues,
      (accumulator, value, index) => Object.assign(accumulator, {
        [value]: basicColorScheme[index],
      }), {});
    context.commit(Mutations.SET_COMPARISON_VARIABLE, payload);
    context.commit(Mutations.SET_COLOR_SCHEME, colorScheme);
    context.commit(Mutations.SET_COMPARISON_VARIABLE_VALUES, comparisonVariableValues);
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
