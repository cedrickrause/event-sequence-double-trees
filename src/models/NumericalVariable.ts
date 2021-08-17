/* eslint-disable import/prefer-default-export */
import { Variable } from './Variable';

export class NumericalVariable implements Variable {
  name: string;

  value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
}
