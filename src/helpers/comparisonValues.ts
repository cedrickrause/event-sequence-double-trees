import { EventDataset, EventDatasetEntry } from '@/models/EventDataset';
import { NumericalVariable } from '@/models/NumericalVariable';
import _ from 'lodash';

// export const getUniqueComparisonVariableValues = (
export default (
  eventDataset: EventDataset,
  variableName: string,
  numericalComparisonValueThreshold: number,
): string[] => {
  if (eventDataset.data[0].variables
    .find((variable) => variable.name === variableName) instanceof NumericalVariable) {
    return ['Over', 'Under'];
  }
  return _.uniq(eventDataset.data.map(
    (event: EventDatasetEntry) => event.variables
      .filter((variable) => variable.name === variableName)
      .map(
        (variable) => {
          if (variable instanceof NumericalVariable) {
            if (variable.value > numericalComparisonValueThreshold) {
              return 'Over';
            }
            return 'Under';
          }
          return variable.value as string;
        },
      ),
  ).flat());
};
