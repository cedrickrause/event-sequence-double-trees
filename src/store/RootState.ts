import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';

export interface RootState {
  eventData: EventDataset | undefined | null,
  initialEventSequenceData: EventSequenceDataset | undefined | null,
  eventSequenceData: EventSequenceDataset | undefined | null,
  selectedElementId: string | null,
  comparisonVariable: Variable | null,
  comparisonVariableValues: string[] | null,
  colorScheme: CategoryToColorMapping[] | null,
  numericalComparisonVariableThreshold: number,
  numericalComparisonVariableMaximum: number,
}
