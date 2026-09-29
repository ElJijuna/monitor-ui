import type { ResourceEntry, ResourceType } from 'monitor-api';
import { useResources } from 'monitor-api/react';
import { COLOR_RESOURCES } from '@/utils/colors';
import { CHART_HISTORY_POINTS } from '@/utils/constants';
import { formatBytes } from '@/utils/formatters';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { formatPercent, shortUrl } from './metricUtils';
import type { ClearableMetricProps, MetricTone } from './types';

export type ResourcesMetricProps = ClearableMetricProps;

/** Asset loads slower than this (ms) are flagged. */
const SLOW_RESOURCE_MS = 1_000;

const TYPE_BADGES: Record<ResourceType, string> = {
  script: 'JS',
  stylesheet: 'CSS',
  image: 'IMG',
  font: 'FONT',
  media: 'MEDIA',
  iframe: 'FRAME',
  other: '—',
};

function resourceTone(entry: ResourceEntry): MetricTone {
  if (entry.status !== null && entry.status >= 400) {
    return 'bad';
  }

  return entry.duration > SLOW_RESOURCE_MS ? 'warn' : 'good';
}

/** Cross-origin servers without Timing-Allow-Origin hide sizes (`cache: 'unknown'`). */
const CACHE_LABELS = { hit: 'cached', unknown: 'size hidden' } as const;

function resourceSubtitle(entry: ResourceEntry): string {
  return [
    entry.cache === 'miss' ? formatBytes(entry.transferSize) : CACHE_LABELS[entry.cache],
    entry.thirdParty && 'third-party',
    entry.renderBlocking && 'render-blocking',
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Page weight and asset timings from the resource collector (Resource Timing API).
 * The collector is off by default: enable it with `collectors: { resources: true }`.
 */
export const ResourcesMetric = ({
  monitor,
  label = 'Resources',
  allowClear = false,
  ...rest
}: ResourcesMetricProps) => {
  const resources = useResources(monitor);
  const { totals, slowest } = resources;
  const hasAssets = totals.count > 0;
  const durations = resources.entries.slice(-CHART_HISTORY_POINTS).map((entry) => entry.duration);
  const slowestDuration = slowest[0]?.duration ?? 0;

  let tone: MetricTone = 'neutral';

  if (hasAssets) {
    tone = totals.failedCount > 0 ? 'bad' : totals.maxDuration > SLOW_RESOURCE_MS ? 'warn' : 'good';
  }

  return (
    <MetricCard
      {...rest}
      accent={COLOR_RESOURCES}
      action={
        allowClear && (
          <MetricAction
            disabled={!hasAssets}
            label="Clear"
            onClick={() => monitor.resources.clearLog()}
          />
        )
      }
      caption={hasAssets ? `${totals.count} assets` : 'waiting'}
      chart={<MetricSpark color={COLOR_RESOURCES} data={durations} variant="bar" />}
      details={
        <MetricList
          emptyText="No assets recorded yet"
          items={slowest.map((entry) => ({
            id: `${entry.url}-${entry.timestamp}`,
            leading: TYPE_BADGES[entry.type],
            primary: shortUrl(entry.url),
            secondary: resourceSubtitle(entry),
            trailing: `${Math.round(entry.duration)}ms`,
            tone: resourceTone(entry),
            ratio: slowestDuration > 0 ? entry.duration / slowestDuration : 0,
          }))}
          title="Slowest assets"
        />
      }
      label={label}
      stats={[
        {
          label: 'Cache hits',
          value: hasAssets ? formatPercent(totals.cacheHits / totals.count) : '—',
        },
        { label: 'Third-party', value: totals.thirdPartyCount },
        { label: 'Render-blocking', value: totals.renderBlockingCount },
        {
          label: 'Failed',
          value: totals.failedCount,
          tone: totals.failedCount > 0 ? 'bad' : undefined,
        },
      ]}
      tone={tone}
      unit={hasAssets ? 'transferred' : undefined}
      value={hasAssets ? formatBytes(totals.transferSize) : '—'}
    />
  );
};
