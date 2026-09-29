import type { WebVitalMetric } from 'monitor-api';
import type { MetricTone } from './types';

/** Number of rows shown in the lg drill-down lists. */
export const METRIC_LIST_MAX_ITEMS = 6;

export function fpsTone(fps: number, hasSamples: boolean): MetricTone {
  if (!hasSamples) {
    return 'neutral';
  }

  if (fps >= 55) {
    return 'good';
  }

  return fps >= 30 ? 'warn' : 'bad';
}

/** Cumulative Layout Shift thresholds from web.dev. */
export function clsTone(cls: number): MetricTone {
  if (cls <= 0.1) {
    return 'good';
  }

  return cls <= 0.25 ? 'warn' : 'bad';
}

export function ratingTone(rating: WebVitalMetric['rating']): MetricTone {
  if (rating === 'good') {
    return 'good';
  }

  return rating === 'needs-improvement' ? 'warn' : 'bad';
}

export function summarize(values: number[]): { min: number; avg: number; max: number } | null {
  if (values.length === 0) {
    return null;
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;

  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }

  return { min, avg: sum / values.length, max };
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Strips the origin of absolute URLs so the path stays readable in narrow rows. */
export function shortUrl(url: string): string {
  try {
    const parsed = new URL(url, 'http://local.invalid');

    return `${parsed.pathname}${parsed.search}` || url;
  } catch {
    return url;
  }
}
