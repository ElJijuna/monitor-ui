import React from 'react';

interface ChartMockProps {
  'data-testid'?: string;
  className?: string;
  [prop: string]: unknown;
}

// Chart props (data, color, highlighted…) are not DOM attributes, so only the DOM-safe ones pass through.
const ChartMock = ({ 'data-testid': testId = 'chart-mock', className }: ChartMockProps) =>
  React.createElement('div', { 'data-testid': testId, className });

export default ChartMock;
export const SparkAreaChart = ChartMock;
export const SparkLineChart = ChartMock;
export const SparkBarChart = ChartMock;
