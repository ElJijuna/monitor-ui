import type {
  ConnectionInfo,
  NetworkWindow5s,
  ReporterSnapshot,
  WebVitalMetric,
} from 'monitor-api';
import { formatVital } from '@/components/MonitorInspector/formatters';
import { connectionTone, formatConnection } from '@/utils/device';
import {
  blockingTone,
  formatPercent,
  fpsTone,
  memoryTone,
  networkTone,
  ratingTone,
  reporterTone,
} from './metricUtils';
import type { MetricTone } from './types';

/** What the health widget reads from the monitor, already narrowed by selectors. */
export interface HealthInput {
  online: boolean | null;
  /** Network Information API estimate; omitted or all-null where the browser lacks it. */
  connection?: ConnectionInfo;
  totalErrors: number;
  /** Latest value of each reported Web Vital. */
  vitals: WebVitalMetric[];
  fps: number;
  fpsSamples: number;
  memoryPercent: number | null;
  longFrames: { count: number; maxBlockingDuration: number | null };
  window5s: NetworkWindow5s;
  assets: { count: number; failed: number };
  reporter: ReporterSnapshot;
}

export interface HealthCheck {
  id: string;
  label: string;
  /** `neutral` when there is nothing to judge yet (no samples, collector off, unsupported). */
  tone: MetricTone;
  /** Short form shown as the widget value when this is the most serious check. */
  summary: string;
  /** Explanation for the drill-down list. */
  detail: string;
}

const SEVERITY: Record<MetricTone, number> = { bad: 0, warn: 1, good: 2, neutral: 3 };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** Collectors that report `neutral` for fine values count as passing once they have data. */
const passing = (tone: MetricTone): MetricTone => (tone === 'neutral' ? 'good' : tone);

function connectionCheck(online: boolean | null, connection?: ConnectionInfo): HealthCheck {
  const base = { id: 'connection', label: 'Connection' };

  if (online === null) {
    return { ...base, tone: 'neutral', summary: '—', detail: 'Not reported yet' };
  }

  if (!online) {
    return { ...base, tone: 'bad', summary: 'Offline', detail: 'The browser reports no network' };
  }

  const quality = connection ? connectionTone(connection) : null;
  const estimate = connection ? formatConnection(connection) : null;

  if (quality === 'bad' || quality === 'warn') {
    return {
      ...base,
      tone: quality,
      summary: `${connection?.effectiveType} network`,
      detail: `Slow connection estimate: ${estimate}`,
    };
  }

  return {
    ...base,
    tone: 'good',
    summary: 'Online',
    detail: estimate ? `A network is reachable · ${estimate}` : 'A network is reachable',
  };
}

function errorsCheck(totalErrors: number): HealthCheck {
  return {
    id: 'errors',
    label: 'Errors',
    tone: totalErrors > 0 ? 'bad' : 'good',
    summary: plural(totalErrors, 'error'),
    detail: totalErrors > 0 ? 'Captured since the monitor started' : 'None captured',
  };
}

function vitalsCheck(vitals: WebVitalMetric[]): HealthCheck {
  const base = { id: 'vitals', label: 'Web Vitals' };
  const [worst] = [...vitals].sort(
    (left, right) => SEVERITY[ratingTone(left.rating)] - SEVERITY[ratingTone(right.rating)],
  );

  if (!worst) {
    return { ...base, tone: 'neutral', summary: 'pending', detail: 'No vitals reported yet' };
  }

  const good = vitals.filter((metric) => metric.rating === 'good').length;
  const tone = ratingTone(worst.rating);

  return {
    ...base,
    tone,
    summary:
      tone === 'good'
        ? `${good}/${vitals.length} good`
        : `${worst.name} ${formatVital(worst.name, worst.value)}`,
    detail: `${good} of ${vitals.length} reported vitals are good`,
  };
}

function frameRateCheck(fps: number, samples: number): HealthCheck {
  const tone = fpsTone(fps, samples > 0);

  return {
    id: 'fps',
    label: 'Frame rate',
    tone,
    summary: `${Math.round(fps)} fps`,
    detail: samples > 0 ? 'Latest sample' : 'No samples yet',
  };
}

function networkCheck(window5s: NetworkWindow5s): HealthCheck {
  const base = { id: 'network', label: 'Network' };

  if (window5s.count === 0) {
    return { ...base, tone: 'neutral', summary: 'idle', detail: 'No requests in the last 5s' };
  }

  return {
    ...base,
    tone: networkTone(window5s),
    summary:
      window5s.errorRate > 0
        ? `${formatPercent(window5s.errorRate)} failed`
        : `${Math.round(window5s.avgLatency)}ms`,
    detail: `${plural(window5s.count, 'request')} in 5s, ${Math.round(window5s.avgLatency)}ms average`,
  };
}

function memoryCheck(percent: number | null): HealthCheck {
  const base = { id: 'memory', label: 'JS heap' };

  if (percent === null) {
    return { ...base, tone: 'neutral', summary: 'n/a', detail: 'Not exposed by this browser' };
  }

  return {
    ...base,
    tone: passing(memoryTone(percent)),
    summary: `${Math.round(percent)}% heap`,
    detail: 'Share of the heap limit in use',
  };
}

function longFramesCheck({ count, maxBlockingDuration }: HealthInput['longFrames']): HealthCheck {
  const worst = Math.round(maxBlockingDuration ?? 0);

  return {
    id: 'long-frames',
    label: 'Long frames',
    tone: count > 0 ? (blockingTone(worst) ?? 'good') : 'good',
    summary: `${worst}ms blocked`,
    detail:
      count > 0 ? `${plural(count, 'frame')}, worst blocked input ${worst}ms` : 'None observed',
  };
}

function assetsCheck({ count, failed }: HealthInput['assets']): HealthCheck {
  const base = { id: 'assets', label: 'Assets' };

  if (count === 0) {
    return {
      ...base,
      tone: 'neutral',
      summary: '—',
      detail: 'None recorded (resources collector)',
    };
  }

  return {
    ...base,
    tone: failed > 0 ? 'warn' : 'good',
    summary: `${plural(failed, 'asset')} failed`,
    detail:
      failed > 0 ? `${failed} of ${count} failed to load` : `${plural(count, 'asset')} loaded`,
  };
}

function reporterCheck(reporter: ReporterSnapshot): HealthCheck {
  const tone = reporterTone(reporter);

  return {
    id: 'reporter',
    label: 'Reporter',
    tone,
    summary: tone === 'warn' ? 'Reporter retrying' : 'Reporter failing',
    detail:
      tone === 'neutral'
        ? `Reporting ${reporter.status}`
        : `${reporter.sent} sent, ${reporter.failed} failed`,
  };
}

/** Every check, most serious first; checks with the same severity keep their priority order. */
export function evaluateHealth(input: HealthInput): HealthCheck[] {
  const checks = [
    connectionCheck(input.online, input.connection),
    errorsCheck(input.totalErrors),
    vitalsCheck(input.vitals),
    frameRateCheck(input.fps, input.fpsSamples),
    networkCheck(input.window5s),
    memoryCheck(input.memoryPercent),
    longFramesCheck(input.longFrames),
    assetsCheck(input.assets),
    reporterCheck(input.reporter),
  ];

  return checks.sort((left, right) => SEVERITY[left.tone] - SEVERITY[right.tone]);
}
