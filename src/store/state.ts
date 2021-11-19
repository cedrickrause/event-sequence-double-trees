import { RootState } from './RootState';

const state: RootState = {
  eventData: null,
  eventTypeIconMapping: null,
  initialEventSequenceData: null,
  eventSequenceData: null,
  centralEventType: '',
  nodeScale: null,
  comparisonVariable: null,
  comparisonVariableValues: [],
  colorScheme: null,
  numericalComparisonVariableThreshold: 0,
  numericalComparisonVariableMaximum: 0,
  variableCount: 0,
};

export { state as default };
