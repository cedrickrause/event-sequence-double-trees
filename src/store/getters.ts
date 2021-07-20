import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { GetterTree } from 'vuex';
import { RootState } from './RootState';

export enum Getters {
  GET_EVENT_DATA = 'getEventData',
  GET_EVENT_SEQUENCE_DATA = 'getEventSequenceData',
  GET_SELECTED_ELEMENT_ID = 'getSelectedElementId',
}

export const getters: GetterTree<RootState, RootState> = {
  [Getters.GET_EVENT_DATA](state) : EventDataset | undefined | null {
    return state.eventData;
  },

  [Getters.GET_EVENT_SEQUENCE_DATA](state) : EventSequenceDataset | undefined | null {
    return state.eventSequenceData;
  },

  [Getters.GET_SELECTED_ELEMENT_ID](state) : string | null {
    return state.selectedElementId;
  },
};
