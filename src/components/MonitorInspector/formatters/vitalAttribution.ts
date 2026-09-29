import type { WebVitalAttributionMap, WebVitalMetric, WebVitalName } from 'monitor-api';

/** One part of a metric's value, in milliseconds. */
export interface VitalPhase {
  label: string;
  value: number;
}

/** Readable summary of a metric's `attribution`, present when the collector enables it. */
export interface VitalAttribution {
  /** Element, resource or script behind the value, or null when the browser does not say. */
  target: string | null;
  /** Parts that add up to the value, in the order they happen. Empty for CLS. */
  phases: VitalPhase[];
}

/**
 * `WebVitalMetric` without a specific name types `attribution` as the union of every summary,
 * so narrow it by the metric name before reading its fields.
 */
function attributionOf<N extends WebVitalName>(
  metric: WebVitalMetric,
  name: N,
): WebVitalAttributionMap[N] | undefined {
  return metric.name === name ? (metric.attribution as WebVitalAttributionMap[N]) : undefined;
}

export function describeAttribution(metric: WebVitalMetric): VitalAttribution | null {
  const lcp = attributionOf(metric, 'LCP');

  if (lcp) {
    return {
      target: lcp.target ?? lcp.url,
      phases: [
        { label: 'Time to first byte', value: lcp.timeToFirstByte },
        { label: 'Resource load delay', value: lcp.resourceLoadDelay },
        { label: 'Resource load', value: lcp.resourceLoadDuration },
        { label: 'Render delay', value: lcp.elementRenderDelay },
      ],
    };
  }

  const inp = attributionOf(metric, 'INP');

  if (inp) {
    const script = inp.longestScript?.invoker;

    return {
      target: [inp.interactionTarget, script && `→ ${script}`].filter(Boolean).join(' ') || null,
      phases: [
        { label: 'Input delay', value: inp.inputDelay },
        { label: 'Processing', value: inp.processingDuration },
        { label: 'Presentation', value: inp.presentationDelay },
      ],
    };
  }

  const cls = attributionOf(metric, 'CLS');

  if (cls) {
    return { target: cls.largestShiftTarget, phases: [] };
  }

  const fcp = attributionOf(metric, 'FCP');

  if (fcp) {
    return {
      target: null,
      phases: [
        { label: 'Time to first byte', value: fcp.timeToFirstByte },
        { label: 'First byte to FCP', value: fcp.firstByteToFCP },
      ],
    };
  }

  const ttfb = attributionOf(metric, 'TTFB');

  if (ttfb) {
    return {
      target: null,
      phases: [
        { label: 'Waiting', value: ttfb.waitingDuration },
        { label: 'Cache', value: ttfb.cacheDuration },
        { label: 'DNS', value: ttfb.dnsDuration },
        { label: 'Connection', value: ttfb.connectionDuration },
        { label: 'Request', value: ttfb.requestDuration },
      ],
    };
  }

  return null;
}

/** The phase that took the longest, or null when there are no timed phases. */
export function dominantPhase(phases: VitalPhase[]): VitalPhase | null {
  return phases.reduce<VitalPhase | null>(
    (longest, phase) => (phase.value > (longest?.value ?? 0) ? phase : longest),
    null,
  );
}
