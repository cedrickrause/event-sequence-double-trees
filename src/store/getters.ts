import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventTypeToIconMapping } from '@/helpers/iconMapping';
import { DoubleTreeSelection } from '@/models/DoubleTreeSelection';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { ScalePower } from 'd3-scale';
import { GetterTree } from 'vuex';
import { RootState } from './RootState';

export enum Getters {
  GET_DATASET_NAME = 'getDatasetName',
  GET_EVENT_DATA = 'getEventData',
  GET_EVENT_TYPE_ICON_MAPPING = 'getEventTypeIconMapping',
  GET_INITIAL_EVENT_SEQUENCE_DATA = 'getInitialEventSequenceData',
  GET_EVENT_SEQUENCE_DATA = 'getEventSequenceData',
  GET_CENTRAL_EVENT_TYPE = 'getCentralEventType',
  GET_HOVERED_EVENT_TYPE = 'getHoveredEventType',
  GET_HOVERED_ATTRIBUTE = 'getHoveredAttribute',
  GET_NODE_SCALE = 'getNodeScale',
  GET_COMPARISON_VARIABLE = 'getComparisonVariable',
  GET_COMPARISON_VARIABLE_VALUES = 'getComparisonVariableValues',
  GET_COLOR_SCHEME = 'getColorScheme',
  GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD = 'getNumericalComparisonVariableThreshold',
  GET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM = 'getNumericalComparisonVariableMaximum',
  GET_VARIABLE_COUNT = 'getVariableCount',
  GET_DOUBLE_TREE_SELECTION = 'getDoubleTreeSelection',
}

export const getters: GetterTree<RootState, RootState> = {
  [Getters.GET_DATASET_NAME](state) : string {
    return state.datasetName;
  },

  [Getters.GET_EVENT_DATA](state) : EventDataset | undefined | null {
    return state.eventData;
  },

  [Getters.GET_EVENT_TYPE_ICON_MAPPING](state) : EventTypeToIconMapping | null {
    return state.eventTypeIconMapping;
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

  [Getters.GET_HOVERED_EVENT_TYPE](state) : string {
    return state.hoveredEventType;
  },

  [Getters.GET_HOVERED_ATTRIBUTE](state) : string {
    return state.hoveredAttribute;
  },

  [Getters.GET_NODE_SCALE](state) : ScalePower<number, number, never> {
    if (state.nodeScale) {
      return state.nodeScale;
    }
    throw new Error('No NodeScale has been provided during data loading.');
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

  [Getters.GET_DOUBLE_TREE_SELECTION](state) : DoubleTreeSelection {
    return state.doubleTreeSelection;
  },
};
