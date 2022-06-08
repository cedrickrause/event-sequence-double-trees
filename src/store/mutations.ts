/* eslint-disable import/no-cycle */
import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventTypeToIconMapping } from '@/helpers/iconMapping';
import { DoubleTreeSelection } from '@/models/DoubleTreeSelection';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { ScalePower } from 'd3-scale';
import { MutationTree } from 'vuex';
import { RootState } from './RootState';

export enum Mutations {
  SET_DATASET_NAME = 'setDatasetName',
  SET_EVENT_DATA = 'setEventData',
  SET_EVENT_TYPE_ICON_MAPPING = 'setEventTypeIconMapping',
  SET_INITIAL_EVENT_SEQUENCE_DATA = 'setInitialEventSequenceData',
  SET_EVENT_SEQUENCE_DATA = 'setEventSequenceData',
  SET_CENTRAL_EVENT_TYPE = 'setCentralEventType',
  SET_HOVERED_EVENT_TYPE = 'setHoveredEventType',
  SET_HOVERED_ATTRIBUTE = 'setHoveredAttribute',
  SET_HOVERED_SEQUENCE = 'setHoveredSequence',
  SET_NODE_SCALE = 'setNodeScale',
  SET_COMPARISON_VARIABLE = 'setComparisonVariable',
  SET_COMPARISON_VARIABLE_VALUES = 'setComparisonVariableValues',
  SET_COLOR_SCHEME = 'setColorScheme',
  SET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD = 'setNumericalComparisonVariableThreshold',
  SET_NUMERICAL_COMPARISON_VARIABLE_MAXIMUM = 'setNumericalComparisonVariableMaximum',
  SET_VARIABLE_COUNT = 'setVariableCount',
  SET_DOUBLE_TREE_SELECTION = 'setDoubleTreeSelection',
}

export const mutations: MutationTree<RootState> = {
  [Mutations.SET_DATASET_NAME](state, payload: string) : void {
    if (payload === 'soccer') {
      state.datasetName = 'Soccer World Cup 2018 Final';
    } else if (payload === 'nobel') {
      state.datasetName = 'Physics Nobel Prize Laureats until 1921';
    } else if (payload === 'flatlands') {
      state.datasetName = 'Flatlands Sample Data';
    } else {
      state.datasetName = '';
    }
  },
  [Mutations.SET_EVENT_DATA](state, payload: EventDataset) : void {
    state.eventData = payload;
  },

  [Mutations.SET_EVENT_TYPE_ICON_MAPPING](state, payload: EventTypeToIconMapping) : void {
    state.eventTypeIconMapping = payload;
  },

  [Mutations.SET_EVENT_SEQUENCE_DATA](state, payload: EventSequenceDataset) : void {
    state.eventSequenceData = payload;
  },

  [Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA](state, payload: EventSequenceDataset) : void {
    state.initialEventSequenceData = payload;
  },

  [Mutations.SET_CENTRAL_EVENT_TYPE](state, payload: string) : void {
    state.centralEventType = payload;
  },

  [Mutations.SET_HOVERED_EVENT_TYPE](state, payload: string) : void {
    state.hoveredEventType = payload;
  },

  [Mutations.SET_HOVERED_ATTRIBUTE](state, payload: string) : void {
    state.hoveredAttribute = payload;
  },
  [Mutations.SET_HOVERED_SEQUENCE](state, payload: string) : void {
    state.hoveredSequence = payload;
  },

  [Mutations.SET_NODE_SCALE](state, payload: ScalePower<number, number, never>) : void {
    state.nodeScale = payload;
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

  [Mutations.SET_DOUBLE_TREE_SELECTION](state, payload: DoubleTreeSelection) : void {
    state.doubleTreeSelection = payload;
  },
};
