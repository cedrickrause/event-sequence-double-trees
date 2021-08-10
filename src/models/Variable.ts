export interface Variable {
  name: string,
  value: unknown
}

export interface CategoricalVariable extends Variable {
  value: string,
}

export interface NumericalVariable extends Variable {
  value: number,
}
