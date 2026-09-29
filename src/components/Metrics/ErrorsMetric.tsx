import { useErrors, useSignal } from 'monitor-api/react';
import { COLOR_FPS_BAD } from '@/utils/colors';
import { formatTime } from '@/utils/formatters';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { METRIC_LIST_MAX_ITEMS } from './metricUtils';
import type { ClearableMetricProps } from './types';

export type ErrorsMetricProps = ClearableMetricProps;

/** Captured JavaScript errors (deduplicated by monitor-api) from the error collector. */
export const ErrorsMetric = ({
  monitor,
  label = 'Errors',
  allowClear = false,
  ...rest
}: ErrorsMetricProps) => {
  const errors = useErrors(monitor);
  const latest = useSignal(monitor.errors.onError);
  const occurrences = errors.entries.reduce((sum, entry) => sum + entry.occurrences, 0);
  const unhandled = errors.entries.filter((entry) => entry.source === 'unhandledrejection').length;
  const recent = errors.entries.slice(-METRIC_LIST_MAX_ITEMS).reverse();

  return (
    <MetricCard
      {...rest}
      action={
        allowClear && (
          <MetricAction
            disabled={errors.entries.length === 0}
            label="Clear"
            onClick={() => monitor.errors.clearLog()}
          />
        )
      }
      caption={latest ? latest.details.name : 'clean'}
      chart={
        <MetricSpark
          color={COLOR_FPS_BAD}
          data={errors.entries.map((entry) => entry.occurrences)}
          variant="bar"
        />
      }
      details={
        <MetricList
          emptyText="No errors captured"
          items={recent.map((entry) => ({
            id: entry.id,
            primary: entry.details.message || entry.details.name,
            secondary: `${entry.source} · ${formatTime(entry.lastSeenAt)}`,
            trailing: `×${entry.occurrences}`,
            tone: 'bad',
            expand: <pre>{entry.details.stack ?? `${entry.details.name}: ${entry.details.message}`}</pre>,
          }))}
          title="Recent errors"
        />
      }
      label={label}
      stats={[
        { label: 'Retained', value: errors.entries.length },
        { label: 'Occurrences', value: occurrences },
        { label: 'Unhandled', value: unhandled, tone: unhandled > 0 ? 'bad' : undefined },
        {
          label: 'Dropped',
          value: errors.droppedErrors,
          tone: errors.droppedErrors > 0 ? 'warn' : undefined,
        },
      ]}
      tone={errors.totalErrors > 0 ? 'bad' : 'good'}
      unit="total"
      value={errors.totalErrors}
    />
  );
};
