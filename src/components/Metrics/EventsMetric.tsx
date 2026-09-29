import { useEvents, useSignal } from 'monitor-api/react';
import { COLOR_EVENTS } from '@/utils/colors';
import { formatTime } from '@/utils/formatters';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { METRIC_LIST_MAX_ITEMS } from './metricUtils';
import type { ClearableMetricProps } from './types';

export type EventsMetricProps = ClearableMetricProps;

/** Custom application events, ranked by label, from the event collector. */
export const EventsMetric = ({
  monitor,
  label = 'Events',
  allowClear = false,
  ...rest
}: EventsMetricProps) => {
  const events = useEvents(monitor);
  // `onEvent` holds the latest event independently of retained-history ordering.
  const latest = useSignal(monitor.events.onEvent);
  const ranked = Object.entries(events.byLabel).sort(([, a], [, b]) => b - a);
  const topCount = ranked[0]?.[1] ?? 0;

  return (
    <MetricCard
      {...rest}
      accent={COLOR_EVENTS}
      action={
        allowClear && (
          <MetricAction
            disabled={events.entries.length === 0}
            label="Clear"
            onClick={() => monitor.events.clearLog()}
          />
        )
      }
      caption={latest ? latest.label : 'no events'}
      chart={<MetricSpark color={COLOR_EVENTS} data={ranked.map(([, n]) => n)} variant="bar" />}
      details={
        <MetricList
          emptyText="No events recorded yet"
          items={ranked.slice(0, METRIC_LIST_MAX_ITEMS).map(([name, n]) => ({
            id: name,
            primary: name,
            trailing: n,
            ratio: topCount > 0 ? n / topCount : 0,
          }))}
          title="By label"
        />
      }
      label={label}
      stats={[
        { label: 'Labels', value: ranked.length },
        { label: 'Top', value: ranked[0]?.[0] ?? '—' },
        { label: 'Last', value: latest ? formatTime(latest.timestamp) : '—' },
        { label: 'Payload', value: latest?.data ? `${Object.keys(latest.data).length} keys` : '—' },
      ]}
      unit="evt"
      value={events.entries.length}
    />
  );
};
