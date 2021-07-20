import { EventSequenceDatasetImpl } from '@/models/EventSequenceDataset';
import { StatsbombEventTransformerImpl } from '@/transformer/StatsbombEventTransformer';
import _ from 'lodash';
import { ActionTree } from 'vuex';
import { Getters } from './getters';
import { Mutations } from './mutations';
import { RootState } from './RootState';

export enum Actions {
  LOAD_EVENT_DATA = 'loadEventData',
  SELECT_ELEMENT = 'selectElement',
}

export const actions: ActionTree<RootState, RootState> = {
  async [Actions.LOAD_EVENT_DATA](context, payload) : Promise<void> {
    const eventData = await StatsbombEventTransformerImpl.instance.transform(payload);
    context.commit(Mutations.SET_EVENT_DATA, eventData);

    const groupedEventArrays = Object.values(_.groupBy(eventData?.data, 'sequence'));
    const eventSequenceData = new EventSequenceDatasetImpl(
      groupedEventArrays.map((sequence) => ({ events: sequence })),
    );
    context.commit(Mutations.SET_EVENT_SEQUENCE_DATA, eventSequenceData);
  },

  [Actions.SELECT_ELEMENT](context, payload): void {
    if (context.getters[Getters.GET_SELECTED_ELEMENT_ID] !== payload) {
      context.commit(Mutations.SET_SELECTED_ELEMENT_ID, payload);
    } else {
      context.commit(Mutations.SET_SELECTED_ELEMENT_ID, null);
    }
  },
};
