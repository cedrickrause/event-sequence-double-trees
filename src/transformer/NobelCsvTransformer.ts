/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { CategoricalVariable } from '@/models/CategoricalVariable';
import { EventDataset, EventDatasetEntry, EventDatasetImpl } from '@/models/EventDataset';
import { EventLocation } from '@/models/LocationVariable';
import { NumericalVariable } from '@/models/NumericalVariable';
import * as d3 from 'd3';
import { DSVRowString } from 'd3';
import { BaseTransformer } from './BaseTransformer';

export interface NobelCsvTransformer extends BaseTransformer {
  transform(filename: string): Promise<EventDataset | undefined>
}

type NobelEvent = {
  age: string,
  eventtype: string,
  firstname: string,
  lastname: string,
  nationality: string,
}

export enum NobelVariableNames {
  NATIONALITY = 'nationality',
  AGE = 'age',
}

function rowTransformer(
  rawRow: DSVRowString<string>,
  index: number,
  columns: string[],
): NobelEvent | null | undefined {
  const age = rawRow.age ?? '-1';
  const eventtype = rawRow.eventtype ?? 'No Eventtype';
  const firstname = rawRow.firstname ?? 'No firstname';
  const lastname = rawRow.lastname ?? 'No Lastname';
  const nationality = rawRow.nationality ?? 'No Nationality';
  return {
    age, eventtype, firstname, lastname, nationality,
  };
}

export class NobelCsvTransformerImpl implements NobelCsvTransformer {
  static instance = new NobelCsvTransformerImpl();

  async transform(filename: string): Promise<EventDataset | undefined> {
    const eventDataset = await d3.csv<NobelEvent, string>(
      filename, rowTransformer,
    ).then((loadedData) => {
      let counter = 0;
      const eventDatasetEntries = loadedData.map((row: NobelEvent) => {
        counter += 1;
        return {
          // eslint-disable-next-line no-plusplus
          id: counter.toString(),
          eventType: row.eventtype,
          sequence: `${row.firstname} ${row.lastname}`,
          variables: [
            new CategoricalVariable(NobelVariableNames.NATIONALITY, row.nationality),
            new NumericalVariable(NobelVariableNames.AGE, +row.age),
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
