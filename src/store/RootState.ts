import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';

export interface RootState {
  eventData: EventDataset | undefined | null,
  eventSequenceData: EventSequenceDataset | undefined | null,
  selectedElementId: string | null,
  comparisonVariable: string | null,
  comparisonVariableValues: string[] | null,
  colorScheme: CategoryToColorMapping[] | null,
}
