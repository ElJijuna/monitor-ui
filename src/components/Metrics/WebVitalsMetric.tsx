import type { WebVitalMetric } from 'monitor-api';
import { useWebVitals } from 'monitor-api/react';
import {
  describeAttribution,
  dominantPhase,
  formatVital,
  VITAL_FULL_NAMES,
  VITAL_ORDER,
} from '@/components/MonitorInspector/formatters';
import { formatTime } from '@/utils/formatters';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { METRIC_LIST_MAX_ITEMS, ratingTone } from './metricUtils';
import type { ClearableMetricProps, MetricTone } from './types';

export type WebVitalsMetricProps = ClearableMetricProps;

/**
 * Row subtitle: with attribution (`webVitals: { attribution: true }`), the element behind the
 * value and its slowest phase; otherwise the navigation type and time.
 */
function reportSubtitle(metric: WebVitalMetric): string {
  const attribution = describeAttribution(metric);
  const slowest = attribution && dominantPhase(attribution.phases);
  const parts = [
    attribution?.target,
    slowest && `${slowest.label} ${formatVital(metric.name, slowest.value)}`,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(' · ')
    : `${metric.navigationType} · ${formatTime(metric.timestamp)}`;
}

/** Core Web Vitals scorecard plus the latest metric reports from the Web Vitals collector. */
export const WebVitalsMetric = ({
  monitor,
  label = 'Web Vitals',
  allowClear = false,
  ...rest
}: WebVitalsMetricProps) => {
  const webVitals = useWebVitals(monitor);
  const latestByName: Record<string, WebVitalMetric | null> = {
    LCP: webVitals.lcp,
    INP: webVitals.inp,
    CLS: webVitals.cls,
    FCP: webVitals.fcp,
    TTFB: webVitals.ttfb,
  };
  const reported = VITAL_ORDER.map((name) => latestByName[name]).filter(
    (metric): metric is WebVitalMetric => metric !== null,
  );
  const good = reported.filter((metric) => metric.rating === 'good').length;
  const recent = webVitals.entries.slice(-METRIC_LIST_MAX_ITEMS).reverse();

  let tone: MetricTone = 'neutral';

  if (reported.some((metric) => metric.rating === 'poor')) {
    tone = 'bad';
  } else if (reported.some((metric) => metric.rating === 'needs-improvement')) {
    tone = 'warn';
  } else if (reported.length > 0) {
    tone = 'good';
  }

  return (
    <MetricCard
      {...rest}
      action={
        allowClear && (
          <MetricAction
            disabled={webVitals.entries.length === 0}
            label="Clear"
            onClick={() => monitor.webVitals.clearLog()}
          />
        )
      }
      caption={
        reported.length > 0 ? `${reported.length}/${VITAL_ORDER.length} reported` : 'pending'
      }
      details={
        <MetricList
          emptyText="Interact with the page to report vitals"
          items={recent.map((metric) => ({
            id: `${metric.id}-${metric.timestamp}`,
            primary: VITAL_FULL_NAMES[metric.name],
            secondary: reportSubtitle(metric),
            leading: metric.name,
            trailing: formatVital(metric.name, metric.value),
            tone: ratingTone(metric.rating),
          }))}
          title="Latest reports"
        />
      }
      label={label}
      stats={VITAL_ORDER.map((name) => {
        const metric = latestByName[name];

        return {
          label: name,
          value: metric ? formatVital(name, metric.value) : '—',
          tone: metric ? ratingTone(metric.rating) : undefined,
        };
      })}
      tone={tone}
      unit="good"
      value={reported.length > 0 ? `${good}/${reported.length}` : '—'}
    />
  );
};
