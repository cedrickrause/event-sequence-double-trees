import { EventDataset, EventDatasetEntry } from '@/models/EventDataset';
import _ from 'lodash';

// export const getUniqueComparisonVariableValues = (
export default (
  eventDataset: EventDataset,
  variableName: string,
): string[] => _.uniq(eventDataset.data.map(
  (event: EventDatasetEntry) => event.variables
    .filter((variable) => variable.name === variableName)
    .map((variable) => variable.value as string),
).flat());
