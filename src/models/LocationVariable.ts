/* eslint-disable import/prefer-default-export */
import { Variable } from './Variable';

export class EventLocation implements Variable {
  name: string;

  value: [number, number];

  constructor(name: string, value: [number, number]) {
    this.name = name;
    this.value = value;
  }
}
