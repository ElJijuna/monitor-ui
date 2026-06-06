import type { WebVitalName } from 'monitor-api';

export const VITAL_ORDER: WebVitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

export const VITAL_FULL_NAMES: Record<WebVitalName, string> = {
  LCP: 'Largest Contentful Paint',
  INP: 'Interaction to Next Paint',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
};

export function formatVital(name: WebVitalName, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }

  return `${Math.round(value)}ms`;
}
