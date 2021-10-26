import { RootState } from './RootState';

const state: RootState = {
  eventData: null,
  initialEventSequenceData: null,
  eventSequenceData: null,
  selectedElementId: null,
  comparisonVariable: null,
  comparisonVariableValues: [],
  colorScheme: null,
  numericalComparisonVariableThreshold: 0,
  numericalComparisonVariableMaximum: 0,
  variableCount: 0,
};

export { state as default };
