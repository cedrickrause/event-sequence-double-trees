import { CategoryToColorMapping } from '@/helpers/d3helpers';
import { EventTypeToIconMapping } from '@/helpers/iconMapping';
import { EventDataset } from '@/models/EventDataset';
import { EventSequenceDataset } from '@/models/EventSequenceDataset';
import { Variable } from '@/models/Variable';
import { ScalePower } from 'd3-scale';

export interface RootState {
  eventData: EventDataset | undefined | null,
  eventTypeIconMapping: EventTypeToIconMapping[],
  initialEventSequenceData: EventSequenceDataset | undefined | null,
  eventSequenceData: EventSequenceDataset | undefined | null,
  centralEventType: string,
  nodeScale: ScalePower<number, number, never> | null,
  comparisonVariable: Variable | null,
  comparisonVariableValues: string[],
  colorScheme: CategoryToColorMapping[] | null,
  numericalComparisonVariableThreshold: number,
  numericalComparisonVariableMaximum: number,
  variableCount: number,
}
