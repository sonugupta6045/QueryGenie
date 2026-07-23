import { ChartConfig } from '../types/query';

export function isBarChart(config: ChartConfig): boolean {
  return config.type === 'bar';
}

export function isLineChart(config: ChartConfig): boolean {
  return config.type === 'line';
}

export function isPieChart(config: ChartConfig): boolean {
  return config.type === 'pie';
}

export function isTable(config: ChartConfig): boolean {
  return config.type === 'table';
}
