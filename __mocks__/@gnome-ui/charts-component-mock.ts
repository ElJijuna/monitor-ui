import type { HTMLAttributes } from 'react';
import React from 'react';

const ChartMock = ({
  'data-testid': testId = 'chart-mock',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { 'data-testid'?: string }) =>
  React.createElement('div', { 'data-testid': testId, ...rest });

export default ChartMock;
export const SparkAreaChart = ChartMock;
export const SparkLineChart = ChartMock;
