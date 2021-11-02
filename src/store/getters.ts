import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { GetterTree } from 'vuex';
import { RootState } from './RootState';

export enum Getters {
  GET_EVENT_DATA = 'getEventData',
  GET_INITIAL_EVENT_SEQUENCE_DATA = 'getInitialEventSequenceData',
  GET_EVENT_SEQUENCE_DATA = 'getEventSequenceData',
  GET_CENTRAL_EVENT_TYPE = 'getCentralEventType',
  GET_COMPARISON_VARIABLE = 'getComparisonVariable',
  GET_COMPARISON_VARIABLE_VALUES = 'getComparisonVariableValues',
  GET_COLOR_SCHEME = 'getColorScheme',
  GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD = 'getNumericalComparisonVariableThreshold',
  GET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM = 'getNumericalComparisonVariableMaximum',
  GET_VARIABLE_COUNT = 'getVariableCount',
}

export const getters: GetterTree<RootState, RootState> = {
  [Getters.GET_EVENT_DATA](state) : EventDataset | undefined | null {
    return state.eventData;
  },

  [Getters.GET_INITIAL_EVENT_SEQUENCE_DATA](state) : EventSequenceDataset | undefined | null {
    return state.initialEventSequenceData;
  },

  [Getters.GET_EVENT_SEQUENCE_DATA](state) : EventSequenceDataset | undefined | null {
    return state.eventSequenceData;
  },

  [Getters.GET_CENTRAL_EVENT_TYPE](state) : string {
    return state.centralEventType;
  },

  [Getters.GET_COMPARISON_VARIABLE](state) : Variable | null {
    return state.comparisonVariable;
  },

  [Getters.GET_COMPARISON_VARIABLE_VALUES](state) : string[] | null {
    return state.comparisonVariableValues;
  },

  [Getters.GET_COLOR_SCHEME](state) : readonly CategoryToColorMapping[] | null {
    return state.colorScheme;
  },

  [Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD](state) : number {
    return state.numericalComparisonVariableThreshold;
  },

  [Getters.GET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM](state) : number {
    return state.numericalComparisonVariableMaximum;
  },

  [Getters.GET_VARIABLE_COUNT](state) : number {
    return state.variableCount;
  },
};
