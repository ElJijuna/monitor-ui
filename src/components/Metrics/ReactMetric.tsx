import { useReact } from 'monitor-api/react';
import { CHART_HISTORY_POINTS } from '@/utils/constants';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { METRIC_LIST_MAX_ITEMS } from './metricUtils';
import type { ClearableMetricProps, MetricTone } from './types';

export type ReactMetricProps = ClearableMetricProps;

const REACT_ACCENT = 'var(--monitor-color-react, #61dafb)';

/**
 * React commits and the most expensive components from the React collector.
 * Avoid enabling the `react` collector on a page that renders this widget from the same
 * React root: every commit it observes re-renders the widget, which is observed again.
 */
export const ReactMetric = ({
  monitor,
  label = 'React',
  allowClear = false,
  ...rest
}: ReactMetricProps) => {
  const react = useReact(monitor);
  const components = Object.entries(react.byComponent).sort(
    ([, a], [, b]) => b.totalDuration - a.totalDuration,
  );
  const renders = components.reduce((sum, [, stats]) => sum + stats.renders, 0);
  const totalDuration = components.reduce((sum, [, stats]) => sum + stats.totalDuration, 0);
  const heaviest = components[0]?.[1].totalDuration ?? 0;
  const slow = react.slowComponents.length;

  let tone: MetricTone = 'neutral';

  if (react.truncatedCommits > 0) {
    tone = 'bad';
  } else if (slow > 0) {
    tone = 'warn';
  } else if (react.totalCommits > 0) {
    tone = 'good';
  }

  return (
    <MetricCard
      {...rest}
      accent={REACT_ACCENT}
      action={
        allowClear && (
          <MetricAction
            disabled={react.totalCommits === 0}
            label="Clear"
            onClick={() => monitor.react.clearLog()}
          />
        )
      }
      caption={slow > 0 ? `${slow} slow` : react.totalCommits > 0 ? 'fast' : 'idle'}
      chart={
        <MetricSpark
          color={REACT_ACCENT}
          data={react.entries.slice(-CHART_HISTORY_POINTS).map((entry) => entry.duration)}
          variant="bar"
        />
      }
      details={
        <MetricList
          emptyText="No renders captured yet"
          items={components.slice(0, METRIC_LIST_MAX_ITEMS).map(([name, stats]) => ({
            id: name,
            primary: name,
            secondary: `${stats.renders} renders · ${stats.avgDuration.toFixed(1)}ms avg`,
            trailing: `${stats.totalDuration.toFixed(1)}ms`,
            ratio: heaviest > 0 ? stats.totalDuration / heaviest : 0,
          }))}
          title="Most expensive components"
        />
      }
      label={label}
      stats={[
        { label: 'Components', value: components.length },
        {
          label: 'Avg render',
          value: renders > 0 ? `${(totalDuration / renders).toFixed(1)}ms` : '—',
        },
        { label: 'Slow', value: slow, tone: slow > 0 ? 'warn' : undefined },
        {
          label: 'Truncated',
          value: react.truncatedCommits,
          tone: react.truncatedCommits > 0 ? 'bad' : undefined,
        },
      ]}
      tone={tone}
      unit="commits"
      value={react.totalCommits}
    />
  );
};
