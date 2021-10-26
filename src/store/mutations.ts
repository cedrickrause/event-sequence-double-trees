import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { MutationTree } from 'vuex';
import { RootState } from './RootState';

export enum Mutations {
  SET_EVENT_DATA = 'setEventData',
  SET_INITIAL_EVENT_SEQUENCE_DATA = 'setInitialEventSequenceData',
  SET_EVENT_SEQUENCE_DATA = 'setEventSequenceData',
  SET_COMPARISON_VARIABLE = 'setComparisonVariable',
  SET_COMPARISON_VARIABLE_VALUES = 'setComparisonVariableValues',
  SET_COLOR_SCHEME = 'setColorScheme',
  SET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD = 'setNumericalComparisonVariableThreshold',
  SET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM = 'setNumericalComparisonVariableMaximum',
  SET_VARIABLE_COUNT = 'setVariableCount',
  SET_SELECTED_ELEMENT_ID = 'setSelectedElementId',
}

export const mutations: MutationTree<RootState> = {
  [Mutations.SET_EVENT_DATA](state, payload: EventDataset) : void {
    state.eventData = payload;
  },

  [Mutations.SET_EVENT_SEQUENCE_DATA](state, payload: EventSequenceDataset) : void {
    state.eventSequenceData = payload;
  },

  [Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA](state, payload: EventSequenceDataset) : void {
    state.initialEventSequenceData = payload;
  },

  [Mutations.SET_COMPARISON_VARIABLE](state, payload: Variable) : void {
    state.comparisonVariable = payload;
  },

  [Mutations.SET_COMPARISON_VARIABLE_VALUES](state, payload: string[]) : void {
    state.comparisonVariableValues = payload;
  },

  [Mutations.SET_COLOR_SCHEME](state, payload: CategoryToColorMapping[]) : void {
    state.colorScheme = payload;
  },

  [Mutations.SET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD](state, payload: number) : void {
    state.numericalComparisonVariableThreshold = payload;
  },

  [Mutations.SET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM](state, payload: number) : void {
    state.numericalComparisonVariableMaximum = payload;
  },

  [Mutations.SET_VARIABLE_COUNT](state, payload: number) : void {
    state.variableCount = payload;
  },

  [Mutations.SET_SELECTED_ELEMENT_ID](state, payload: string) : void {
    state.selectedElementId = payload;
  },
};
