import type {
  PerformanceSnapshot,
  ResourceSnapshot,
  WebVitalMetric,
  WebVitalsSnapshot,
} from 'monitor-api';
import {
  shallowEqual,
  useDevice,
  useErrors,
  useNetwork,
  usePerformance,
  useResources,
  useSignal,
  useWebVitals,
} from 'monitor-api/react';
import { selectOnline, selectWindow5s } from '@/utils/selectors';
import { evaluateHealth } from './healthChecks';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import type { MetricBaseProps, MetricTone } from './types';

export type HealthMetricProps = MetricBaseProps;

/* Selectors at module scope: the hooks memoize on their identity. */
const selectPerformance = ({
  fps,
  fpsHistory,
  memory,
  longAnimationFrames,
}: PerformanceSnapshot) => ({
  fps,
  fpsSamples: fpsHistory.length,
  memoryPercent: memory?.percent ?? null,
  longFrameCount: longAnimationFrames.count,
  maxBlockingDuration: longAnimationFrames.maxBlockingDuration,
});

const selectVitals = ({ lcp, inp, cls, fcp, ttfb }: WebVitalsSnapshot) => {
  const latest: (WebVitalMetric | null)[] = [lcp, inp, cls, fcp, ttfb];

  return latest.filter((metric): metric is WebVitalMetric => metric !== null);
};

const selectAssets = ({ totals }: ResourceSnapshot) => ({
  count: totals.count,
  failed: totals.failedCount,
});

const selectTotalErrors = (snapshot: { totalErrors: number }) => snapshot.totalErrors;

const CAPTIONS: Record<MetricTone, (issues: number) => string> = {
  bad: (issues) => `${issues} issue${issues === 1 ? '' : 's'}`,
  warn: (issues) => `${issues} issue${issues === 1 ? '' : 's'}`,
  good: () => 'all good',
  neutral: () => 'waiting',
};

/**
 * One-glance summary of every collector: the value is the most serious current problem
 * (offline, errors, a poor Web Vital, low FPS, failing requests…) and lg lists every check.
 * Handy as a single pill when there is room for only one.
 */
export const HealthMetric = ({ monitor, label = 'Health', ...rest }: HealthMetricProps) => {
  const online = useDevice(monitor, selectOnline);
  const totalErrors = useErrors(monitor, selectTotalErrors);
  const vitals = useWebVitals(monitor, selectVitals, shallowEqual);
  const performance = usePerformance(monitor, selectPerformance, shallowEqual);
  const window5s = useNetwork(monitor, selectWindow5s, shallowEqual);
  const assets = useResources(monitor, selectAssets, shallowEqual);
  const reporter = useSignal(monitor.reporter.snapshot);

  const checks = evaluateHealth({
    online,
    totalErrors,
    vitals,
    fps: performance.fps,
    fpsSamples: performance.fpsSamples,
    memoryPercent: performance.memoryPercent,
    longFrames: {
      count: performance.longFrameCount,
      maxBlockingDuration: performance.maxBlockingDuration,
    },
    window5s,
    assets,
    reporter,
  });
  const count = (tone: MetricTone) => checks.filter((check) => check.tone === tone).length;
  const issues = count('bad') + count('warn');
  const [top] = checks;
  const tone: MetricTone = top?.tone ?? 'neutral';

  return (
    <MetricCard
      {...rest}
      caption={CAPTIONS[tone](issues)}
      details={
        <MetricList
          items={checks.map((check) => ({
            id: check.id,
            primary: check.label,
            secondary: check.detail,
            trailing: check.tone === 'neutral' ? '—' : check.summary,
            tone: check.tone === 'neutral' ? undefined : check.tone,
          }))}
          title="Checks"
        />
      }
      label={label}
      stats={[
        { label: 'Critical', value: count('bad'), tone: count('bad') > 0 ? 'bad' : undefined },
        { label: 'Warnings', value: count('warn'), tone: count('warn') > 0 ? 'warn' : undefined },
        { label: 'Passing', value: count('good') },
        { label: 'Pending', value: count('neutral') },
      ]}
      tone={tone}
      value={issues > 0 && top ? top.summary : tone === 'good' ? 'OK' : '—'}
    />
  );
};
