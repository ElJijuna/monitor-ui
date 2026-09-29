import { usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { COLOR_MEMORY } from '@/utils/colors';
import { memoryColor } from '@/utils/fpsColor';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { summarize } from './metricUtils';
import type { ClearableMetricProps, MetricTone } from './types';

export type MemoryMetricProps = ClearableMetricProps;

function memoryTone(percent: number): MetricTone {
  if (percent > 80) {
    return 'bad';
  }

  return percent > 60 ? 'warn' : 'neutral';
}

/** JS heap usage (Chromium only) from the performance collector. */
export const MemoryMetric = ({
  monitor,
  label = 'JS Heap',
  allowClear = false,
  ...rest
}: MemoryMetricProps) => {
  const performance = usePerformance(monitor);
  const { memory, memoryHistory: history } = performance;
  const summary = summarize(history);
  const trend = history.length > 1 ? (history[history.length - 1] ?? 0) - (history[0] ?? 0) : null;
  const action = allowClear && (
    <MetricAction
      disabled={history.length === 0}
      label="Clear"
      onClick={() => monitor.performance.clearHistory()}
    />
  );

  if (!memory) {
    return (
      <MetricCard
        {...rest}
        accent={COLOR_MEMORY}
        action={action}
        caption="unsupported"
        label={label}
        value="—"
      />
    );
  }

  return (
    <MetricCard
      {...rest}
      accent={COLOR_MEMORY}
      action={action}
      caption={`${Math.round(memory.percent)}% used`}
      chart={
        <MetricSpark
          color={memoryColor(memory.percent)}
          data={toChartData(history, memory.percent)}
        />
      }
      details={
        <MetricList
          items={[
            {
              id: 'used',
              primary: 'Used',
              trailing: `${Math.round(memory.used)} MB`,
              ratio: memory.percent / 100,
              tone: memoryTone(memory.percent),
            },
            {
              id: 'peak',
              primary: 'Peak (retained)',
              trailing: summary ? `${Math.round(summary.max)}%` : '—',
              ratio: summary ? summary.max / 100 : undefined,
            },
            {
              id: 'avg',
              primary: 'Average (retained)',
              trailing: summary ? `${Math.round(summary.avg)}%` : '—',
              ratio: summary ? summary.avg / 100 : undefined,
            },
            { id: 'limit', primary: 'Heap limit', trailing: `${Math.round(memory.total)} MB` },
          ]}
          title="Heap usage"
        />
      }
      label={label}
      stats={[
        {
          label: 'Used',
          value: `${Math.round(memory.percent)}%`,
          tone: memoryTone(memory.percent),
        },
        { label: 'Limit', value: `${Math.round(memory.total)} MB` },
        { label: 'Peak', value: summary ? `${Math.round(summary.max)}%` : '—' },
        {
          label: 'Trend',
          value: trend === null ? '—' : `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
          tone: trend !== null && trend > 5 ? 'warn' : undefined,
        },
      ]}
      tone={memoryTone(memory.percent)}
      unit="MB"
      value={Math.round(memory.used)}
    />
  );
};
