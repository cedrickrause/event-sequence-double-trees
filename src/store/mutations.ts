import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { MutationTree } from 'vuex';
import { RootState } from './RootState';

export enum Mutations {
  SET_EVENT_DATA = 'setEventData',
  SET_EVENT_SEQUENCE_DATA = 'setEventSequenceData',
  SET_SELECTED_ELEMENT_ID = 'setSelectedElementId',
}

export const mutations: MutationTree<RootState> = {
  [Mutations.SET_EVENT_DATA](state, payload: EventDataset) : void {
    state.eventData = payload;
  },

  [Mutations.SET_EVENT_SEQUENCE_DATA](state, payload: EventSequenceDataset) : void {
    state.eventSequenceData = payload;
  },

  [Mutations.SET_SELECTED_ELEMENT_ID](state, payload: string) : void {
    state.selectedElementId = payload;
  },
};
