import type { ReporterSnapshot } from 'monitor-api';
import { useSignal } from 'monitor-api/react';
import { useState } from 'react';
import { formatTime } from '@/utils/formatters';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import type { MetricBaseProps, MetricTone } from './types';

export interface ReporterMetricProps extends MetricBaseProps {
  /** Shows a Send now action (md and up) that calls `monitor.reporter.flush()`. */
  allowFlush?: boolean;
}

function reporterTone(reporter: ReporterSnapshot): MetricTone {
  if (reporter.status === 'retrying') {
    return 'warn';
  }

  if (reporter.status === 'idle' || reporter.status === 'sending') {
    return reporter.lastFailure && reporter.failed > reporter.sent ? 'bad' : 'good';
  }

  return 'neutral';
}

/** Production report delivery status and counters from `monitor.reporter`. */
export const ReporterMetric = ({
  monitor,
  label = 'Reporter',
  allowFlush = false,
  ...rest
}: ReporterMetricProps) => {
  const reporter = useSignal(monitor.reporter.snapshot);
  const [flushing, setFlushing] = useState(false);

  const flush = async () => {
    setFlushing(true);
    try {
      await monitor.reporter.flush();
    } catch {
      // The failure is already reflected by the reporter snapshot (failed / lastFailure).
    } finally {
      setFlushing(false);
    }
  };

  return (
    <MetricCard
      {...rest}
      action={
        allowFlush && (
          <MetricAction
            disabled={reporter.status !== 'idle' || flushing}
            label={flushing ? 'Sending…' : 'Send now'}
            onClick={flush}
          />
        )
      }
      caption={reporter.status}
      details={
        <MetricList
          items={[
            { id: 'attempts', primary: 'Attempts', trailing: reporter.attempts },
            {
              id: 'last-success',
              primary: 'Last success',
              trailing: reporter.lastSuccessAt === null ? '—' : formatTime(reporter.lastSuccessAt),
              tone: reporter.lastSuccessAt === null ? undefined : 'good',
            },
            {
              id: 'last-failure',
              primary: 'Last failure',
              trailing: reporter.lastFailure ?? '—',
              tone: reporter.lastFailure ? 'bad' : undefined,
            },
            { id: 'cancelled', primary: 'Cancelled', trailing: reporter.cancelled },
            {
              id: 'skipped',
              primary: 'Skipped',
              secondary: 'Nothing new to send',
              trailing: reporter.skipped,
            },
          ]}
          title="Delivery"
        />
      }
      label={label}
      stats={[
        { label: 'Failed', value: reporter.failed, tone: reporter.failed > 0 ? 'bad' : undefined },
        {
          label: 'Retries',
          value: reporter.retries,
          tone: reporter.retries > 0 ? 'warn' : undefined,
        },
        {
          label: 'Dropped',
          value: reporter.dropped,
          tone: reporter.dropped > 0 ? 'warn' : undefined,
        },
        {
          label: 'Last sent',
          value: reporter.lastSuccessAt === null ? '—' : formatTime(reporter.lastSuccessAt),
        },
      ]}
      tone={reporterTone(reporter)}
      unit="sent"
      value={reporter.sent}
    />
  );
};
