import { useDevice, useNetwork } from 'monitor-api/react';
import { COLOR_LATENCY } from '@/utils/colors';
import { CHART_HISTORY_POINTS } from '@/utils/constants';
import { formatBytes } from '@/utils/formatters';
import { selectOnline } from '@/utils/selectors';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { formatPercent, METRIC_LIST_MAX_ITEMS, shortUrl } from './metricUtils';
import type { ClearableMetricProps, MetricTone } from './types';

export type NetworkMetricProps = ClearableMetricProps;

/** Latency above this value (ms) is flagged as slow. */
const SLOW_LATENCY_MS = 500;

/**
 * Rolling request latency, throughput and error rate from the network collector, flagged when
 * the device collector reports the browser offline.
 */
export const NetworkMetric = ({
  monitor,
  label = 'Network',
  allowClear = false,
  ...rest
}: NetworkMetricProps) => {
  const network = useNetwork(monitor);
  const offline = useDevice(monitor, selectOnline) === false;
  const { count, avgLatency, errorRate, totalPayload } = network.window5s;
  const hasTraffic = count > 0;
  const latencies = network.entries.slice(-CHART_HISTORY_POINTS).map((entry) => entry.latency);
  const recent = network.entries.slice(-METRIC_LIST_MAX_ITEMS).reverse();

  let tone: MetricTone = 'neutral';

  if (offline) {
    tone = 'bad';
  } else if (hasTraffic) {
    tone =
      avgLatency > SLOW_LATENCY_MS || errorRate >= 0.5 ? 'bad' : errorRate > 0 ? 'warn' : 'good';
  }

  return (
    <MetricCard
      {...rest}
      accent={COLOR_LATENCY}
      action={
        allowClear && (
          <MetricAction
            disabled={network.entries.length === 0}
            label="Clear"
            onClick={() => monitor.network.clearLog()}
          />
        )
      }
      caption={offline ? 'offline' : hasTraffic ? `${count} req / 5s` : 'idle'}
      chart={<MetricSpark color={COLOR_LATENCY} data={latencies} />}
      details={
        <MetricList
          emptyText="No requests captured yet"
          items={recent.map((entry) => {
            const failed = Boolean(entry.error) || entry.status >= 400;

            return {
              id: entry.id,
              leading: entry.status || 'ERR',
              primary: shortUrl(entry.url),
              secondary: `${entry.method} · ${entry.initiator} · ${formatBytes(entry.payloadSize)}`,
              trailing: `${Math.round(entry.latency)}ms`,
              tone: failed ? 'bad' : entry.latency > SLOW_LATENCY_MS ? 'warn' : 'good',
            };
          })}
          title="Recent requests"
        />
      }
      label={label}
      stats={[
        { label: 'Requests', value: count },
        {
          label: 'Errors',
          value: hasTraffic ? formatPercent(errorRate) : '—',
          tone: errorRate > 0 ? 'bad' : undefined,
        },
        { label: 'Payload', value: formatBytes(totalPayload) },
        { label: 'Retained', value: network.entries.length },
      ]}
      tone={tone}
      unit={hasTraffic ? 'ms' : undefined}
      value={hasTraffic ? Math.round(avgLatency) : '—'}
    />
  );
};
