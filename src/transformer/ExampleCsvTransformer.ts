/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { CategoricalVariable } from '@/models/CategoricalVariable';
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import { EventLocation } from '@/models/LocationVariable';
import { NumericalVariable } from '@/models/NumericalVariable';
import * as d3 from 'd3';
import { DSVRowString } from 'd3';
import { BaseTransformer } from './BaseTransformer';

export interface ExampleCsvTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type ExampleEvent = {
  sequence: string,
  eventType: string,
}

export enum ExampleVariableNames {
}

function rowTransformer(
  rawRow: DSVRowString<string>,
  index: number,
  columns: string[],
): ExampleEvent | null | undefined {
  const sequence = rawRow.sequence ?? '-1';
  const eventType = rawRow.eventType ?? 'No Eventtype';
  console.log(rawRow);
  console.log({
    sequence, eventType,
  });
  return {
    sequence, eventType,
  };
}

export class ExampleCsvTransformerImpl implements ExampleCsvTransformer {
  static instance = new ExampleCsvTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.csv<ExampleEvent, string>(
      filename, rowTransformer,
    ).then((loadedData) => {
      let counter = 0;
      const eventDatasetEntries = loadedData.map((row: ExampleEvent) => {
        counter += 1;
        console.log(row);
        return {
          id: row.sequence,
          eventType: row.eventType,
          sequence: row.sequence,
          variables: [
          ],
        };
      });

      return new EventDatasetImpl(
        eventDatasetEntries,
      );
    });
    return eventDataset;
  }
}
