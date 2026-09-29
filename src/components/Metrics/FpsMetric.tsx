import { usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { fpsColor } from '@/utils/fpsColor';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import { clsTone, fpsTone, summarize } from './metricUtils';
import type { ClearableMetricProps } from './types';

export type FpsMetricProps = ClearableMetricProps;

const FPS_CAPTION = { neutral: 'waiting', good: 'smooth', warn: 'janky', bad: 'slow' } as const;

/** Frame rate, long tasks and layout shift from the performance collector. */
export const FpsMetric = ({
  monitor,
  label = 'FPS',
  allowClear = false,
  ...rest
}: FpsMetricProps) => {
  const performance = usePerformance(monitor);
  const history = performance.fpsHistory;
  const fps = Math.round(performance.fps);
  const tone = fpsTone(performance.fps, history.length > 0);
  const summary = summarize(history);
  const { count: longTasks, lastDuration } = performance.longTasks;

  return (
    <MetricCard
      {...rest}
      action={
        allowClear && (
          <MetricAction
            disabled={history.length === 0}
            label="Clear"
            onClick={() => monitor.performance.clearHistory()}
          />
        )
      }
      caption={FPS_CAPTION[tone]}
      chart={<MetricSpark color={fpsColor(fps)} data={toChartData(history, fps)} />}
      details={
        <MetricList
          items={[
            {
              id: 'long-tasks',
              primary: 'Long tasks',
              secondary: 'Main thread blocked > 50ms',
              trailing: longTasks,
              tone: longTasks > 0 ? 'warn' : undefined,
            },
            {
              id: 'last-long-task',
              primary: 'Last long task',
              trailing: lastDuration === null ? '—' : `${Math.round(lastDuration)}ms`,
            },
            {
              id: 'cls',
              primary: 'Layout shift (CLS)',
              secondary: 'Cumulative, from layout-shift entries',
              trailing: performance.cls.toFixed(3),
              tone: clsTone(performance.cls),
            },
            { id: 'samples', primary: 'Samples retained', trailing: history.length },
          ]}
          title="Rendering"
        />
      }
      label={label}
      stats={[
        { label: 'Min', value: summary ? Math.round(summary.min) : '—' },
        { label: 'Avg', value: summary ? Math.round(summary.avg) : '—' },
        { label: 'Max', value: summary ? Math.round(summary.max) : '—' },
        { label: 'Long tasks', value: longTasks, tone: longTasks > 0 ? 'warn' : undefined },
      ]}
      tone={tone}
      unit="fps"
      value={fps}
    />
  );
};
