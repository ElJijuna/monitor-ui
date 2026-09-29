import type {
  LongAnimationFrameEntry,
  NetworkWindow5s,
  ReporterSnapshot,
  WebVitalMetric,
} from 'monitor-api';
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

/** JS heap usage, as a percentage of the heap limit. */
export function memoryTone(percent: number): MetricTone {
  if (percent > 80) {
    return 'bad';
  }

  return percent > 60 ? 'warn' : 'neutral';
}

/** Latency above this value (ms) is flagged as slow. */
export const SLOW_LATENCY_MS = 500;

/** Rolling network health: slow or mostly failing is bad, any failure is a warning. */
export function networkTone({ avgLatency, errorRate }: NetworkWindow5s): MetricTone {
  if (avgLatency > SLOW_LATENCY_MS || errorRate >= 0.5) {
    return 'bad';
  }

  return errorRate > 0 ? 'warn' : 'good';
}

/** Report delivery: retrying is a warning, more failures than deliveries is bad. */
export function reporterTone(reporter: ReporterSnapshot): MetricTone {
  if (reporter.status === 'retrying') {
    return 'warn';
  }

  if (reporter.status === 'idle' || reporter.status === 'sending') {
    return reporter.lastFailure && reporter.failed > reporter.sent ? 'bad' : 'good';
  }

  return 'neutral';
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

/** Whether the browser reports `long-animation-frame` entries (Chromium 123+). */
export function supportsLongAnimationFrames(): boolean {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    (PerformanceObserver.supportedEntryTypes ?? []).includes('long-animation-frame')
  );
}

/**
 * Tone for the time a long animation frame blocked input. 200ms matches the INP "good"
 * limit: past it, a single frame is enough to make an interaction feel slow.
 */
export function blockingTone(blockingDuration: number): MetricTone | undefined {
  if (blockingDuration <= 0) {
    return undefined;
  }

  return blockingDuration >= 200 ? 'bad' : 'warn';
}

/** Names the longest script of a long animation frame, falling back to the frame itself. */
export function describeFrame(frame: LongAnimationFrameEntry): {
  primary: string;
  secondary: string;
} {
  const [script] = frame.scripts;

  if (!script) {
    return { primary: 'Unattributed frame', secondary: `${Math.round(frame.duration)}ms frame` };
  }

  const source = script.sourceURL ? shortUrl(script.sourceURL) : null;
  const primary =
    script.invoker ?? script.sourceFunctionName ?? source ?? script.invokerType ?? 'Script';
  const secondary = [script.invokerType ?? 'script', `${Math.round(script.duration)}ms`, source]
    .filter(Boolean)
    .join(' · ');

  return { primary, secondary };
}
