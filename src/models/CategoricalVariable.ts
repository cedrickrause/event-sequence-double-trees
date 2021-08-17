/* eslint-disable import/prefer-default-export */
import { Variable } from './Variable';

export class CategoricalVariable implements Variable {
  name: string;

  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}
