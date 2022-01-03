/* eslint-disable import/no-cycle */
import {
  compressEventSequences,
  removeEventsWithUnusedTypes,
  getMaxNumberOfSequencesWithOneEventType,
  getEventSequenceDataFromEventData,
} from '@/helpers/eventFiltering';
import getUniqueComparisonVariableValues from '@/helpers/comparisonValues';
import applyQueryToEventSequenceDataset from '@/helpers/eventSequenceFiltering';
import { nodeMinimumSize, nodeMaximumSize } from '@/helpers/config';
import { EventDataset, EventDatasetEntry } from '@/models/EventDataset';
import { EventSequence, EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { StatsbombEventTransformerImpl } from '@/transformer/StatsbombEventTransformer';
import _ from 'lodash';
import { ActionTree } from 'vuex';
import { scaleSqrt } from 'd3-scale';
import { NobelCsvTransformerImpl } from '@/transformer/NobelCsvTransformer';
import { FlatlandsEventTransformerImpl } from '@/transformer/FlatlandsTransformer';
import { nobelEventTypeIconMapping, soccerEventTypeIconMapping } from '@/helpers/iconMapping';
import categoryColors20 from '@/helpers/colorScheme';
import { ExampleCsvTransformerImpl } from '@/transformer/ExampleCsvTransformer';
import { Getters } from './getters';
import { Mutations } from './mutations';
import { RootState } from './RootState';

export enum Actions {
  LOAD_SOCCER_EVENT_DATA = 'loadEventData',
  LOAD_NOBEL_EVENT_DATA = 'loadNobelEventData',
  LOAD_FLATLANDS_EVENT_DATA = 'loadFlatlandsEventData',
  LOAD_EXAMPLE_EVENT_DATA = 'loadExampleEventData',
  LOAD_DATASET = 'loadDataset',
  SELECT_COMPARISON_VARIABLE = 'selectComparisonVariable',
  FILTER_EVENT_SEQUENCE_WITH_QUERY = 'filterEventSequenceWithQuery',
  UPDATE_CENTRAL_EVENT_TYPE = 'updateCentralEventType',
  RESET_EVENT_SEQUENCE_DATA = 'resetEventSequenceData',
  ADD_SEQUENCE_TO_DOUBLE_TREE_SELECTION = 'addSequenceToDoubleTreeSelection',
}

export const actions: ActionTree<RootState, RootState> = {
  async [Actions.LOAD_SOCCER_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await StatsbombEventTransformerImpl.instance.transform(payload);
    const filteredEventData = removeEventsWithUnusedTypes(eventData);
    context.commit(Mutations.SET_EVENT_DATA, filteredEventData);
    context.commit(Mutations.SET_VARIABLE_COUNT, filteredEventData?.data[0].variables.length);
    context.commit(Mutations.SET_EVENT_TYPE_ICON_MAPPING, soccerEventTypeIconMapping);

    const eventSequenceData = getEventSequenceDataFromEventData(filteredEventData, 'sequence');

    const nodeScale = scaleSqrt()
      .domain([1, getMaxNumberOfSequencesWithOneEventType(filteredEventData, eventSequenceData)])
      .range([nodeMinimumSize, nodeMaximumSize]);
    context.commit(Mutations.SET_NODE_SCALE, nodeScale);

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
    context.commit(Mutations.SET_EVENT_TYPE_ICON_MAPPING, nobelEventTypeIconMapping);

    const eventSequenceData = getEventSequenceDataFromEventData(eventData, 'sequence');

    const nodeScale = scaleSqrt()
      .domain([1, getMaxNumberOfSequencesWithOneEventType(eventData, eventSequenceData)])
      .range([nodeMinimumSize, nodeMaximumSize]);
    context.commit(Mutations.SET_NODE_SCALE, nodeScale);

    eventSequenceData.addEndOfSequenceEvents();
    eventSequenceData.addStartOfSequenceEvents();
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, eventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, eventSequenceData);
  },

  async [Actions.LOAD_FLATLANDS_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await FlatlandsEventTransformerImpl.instance.transform(payload);
    context.commit(Mutations.SET_EVENT_DATA, eventData);
    context.commit(Mutations.SET_VARIABLE_COUNT, eventData?.data[0].variables.length);
    context.commit(Mutations.SET_EVENT_TYPE_ICON_MAPPING, Object.fromEntries(
      _.uniq(eventData?.data
        .map((event) => event.eventType))
        .map((eventType) => [eventType, eventType.slice(eventType.indexOf(' ') + 1)]),
    ));

    const eventSequenceData = getEventSequenceDataFromEventData(eventData, 'sequence');

    const nodeScale = scaleSqrt()
      .domain([1, getMaxNumberOfSequencesWithOneEventType(eventData, eventSequenceData)])
      .range([nodeMinimumSize, nodeMaximumSize]);
    context.commit(Mutations.SET_NODE_SCALE, nodeScale);

    eventSequenceData.addEndOfSequenceEvents();
    eventSequenceData.addStartOfSequenceEvents();
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, eventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, eventSequenceData);
  },

  async [Actions.LOAD_EXAMPLE_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await ExampleCsvTransformerImpl.instance.transform(payload);
    context.commit(Mutations.SET_EVENT_DATA, eventData);
    context.commit(Mutations.SET_VARIABLE_COUNT, eventData?.data[0].variables.length);
    context.commit(Mutations.SET_EVENT_TYPE_ICON_MAPPING, Object.fromEntries(
      _.uniq(eventData?.data
        .map((event) => event.eventType))
        .map((eventType) => [eventType, eventType.slice(0, 2)]),
    ));

    const eventSequenceData = getEventSequenceDataFromEventData(eventData, 'sequence');

    const nodeScale = scaleSqrt()
      .domain([1, getMaxNumberOfSequencesWithOneEventType(eventData, eventSequenceData)])
      .range([nodeMinimumSize, nodeMaximumSize]);
    context.commit(Mutations.SET_NODE_SCALE, nodeScale);

    eventSequenceData.addEndOfSequenceEvents();
    eventSequenceData.addStartOfSequenceEvents();
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, eventSequenceData);
    context.commit(Mutations.SET_INITIAL_EVENT_SEQUENCE_DATA, eventSequenceData);
  },

  async [Actions.LOAD_DATASET](context, payload) : Promise<void> {
    context.commit(Mutations.SET_COMPARISON_VARIABLE, null);
    context.commit(Mutations.SET_COMPARISON_VARIABLE_VALUES, []);
    context.commit(Mutations.SET_COLOR_SCHEME, null);
    context.commit(Mutations.SET_DATASET_NAME, payload);
    if (payload === 'soccer') {
      context.dispatch(Actions.LOAD_SOCCER_EVENT_DATA, ('./data/events.json'));
    }
    if (payload === 'nobel') {
      context.dispatch(Actions.LOAD_NOBEL_EVENT_DATA, ('./data/nobel.csv'));
    }
    if (payload === 'flatlands') {
      context.dispatch(Actions.LOAD_FLATLANDS_EVENT_DATA, ('./data/level20map3_v2.json'));
    }
    if (payload === 'example') {
      context.dispatch(Actions.LOAD_EXAMPLE_EVENT_DATA, ('./data/example.csv'));
    }
  },

  [Actions.SELECT_COMPARISON_VARIABLE](context, payload: Variable): void {
    const eventDataset: EventDataset = context.getters[Getters.GET_EVENT_DATA];
    const comparisonVariableValues = getUniqueComparisonVariableValues(
      eventDataset,
      payload?.name,
      context.getters[Getters.GET_NUMERICAL_COMPARISON_VARIABLE_THRESHOLD],
    );
    let basicColorScheme: string[] = [];
    basicColorScheme = categoryColors20;
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

  [Actions.UPDATE_CENTRAL_EVENT_TYPE](context, payload): void {
    context.commit(Mutations.SET_DOUBLE_TREE_SELECTION, {
      left: [],
      right: [],
    });
    context.commit(Mutations.SET_CENTRAL_EVENT_TYPE, payload);
    const filteredSequence = context.getters.getInitialEventSequenceData.data.filter(
      (sequence: EventSequence) => sequence.events.findIndex(
        (event) => event.eventType === payload,
      ) > -1,
    );
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, {
      data: filteredSequence,
    });
  },

  [Actions.RESET_EVENT_SEQUENCE_DATA](context): void {
    const initialEventSequenceData = context.getters[Getters.GET_INITIAL_EVENT_SEQUENCE_DATA];
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, initialEventSequenceData);
  },

  [Actions.ADD_SEQUENCE_TO_DOUBLE_TREE_SELECTION](context, payload): void {
    const selection = context.getters.getDoubleTreeSelection;
    selection.left.push(payload);
    context.commit(Mutations.SET_DOUBLE_TREE_SELECTION, selection);
  },
};
