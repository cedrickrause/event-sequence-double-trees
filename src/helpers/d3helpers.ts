import * as d3 from 'd3';

export type SvgSelection = d3.Selection<SVGSVGElement, unknown, null, unknown>;

export interface HierarchyDatum {
  type: string;
  value: number;
  children: Array<HierarchyDatum>;
}
