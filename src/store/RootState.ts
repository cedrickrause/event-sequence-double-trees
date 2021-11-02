import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';

export interface RootState {
  eventData: EventDataset | undefined | null,
  initialEventSequenceData: EventSequenceDataset | undefined | null,
  eventSequenceData: EventSequenceDataset | undefined | null,
  centralEventType: string,
  comparisonVariable: Variable | null,
  comparisonVariableValues: string[],
  colorScheme: CategoryToColorMapping[] | null,
  numericalComparisonVariableThreshold: number,
  numericalComparisonVariableMaximum: number,
  variableCount: number,
}
