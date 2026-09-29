import { usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { fpsColor } from '@/utils/fpsColor';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';
import {
  blockingTone,
  clsTone,
  describeFrame,
  fpsTone,
  METRIC_LIST_MAX_ITEMS,
  summarize,
  supportsLongAnimationFrames,
} from './metricUtils';
import type { ClearableMetricProps } from './types';

export type FpsMetricProps = ClearableMetricProps;

const FPS_CAPTION = { neutral: 'waiting', good: 'smooth', warn: 'janky', bad: 'slow' } as const;

/**
 * Frame rate, long animation frames (with the script behind each one) and layout shift from
 * the performance collector.
 */
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
  const loaf = performance.longAnimationFrames;
  // Frames already reported prove support, even where `supportedEntryTypes` is missing.
  const loafSupported = loaf.count > 0 || supportsLongAnimationFrames();
  const worstTone = blockingTone(loaf.maxBlockingDuration ?? 0);
  const frames = loaf.entries.slice(-METRIC_LIST_MAX_ITEMS).reverse();

  return (
    <MetricCard
      {...rest}
      action={
        allowClear && (
          <MetricAction
            disabled={history.length === 0 && loaf.entries.length === 0}
            label="Clear"
            onClick={() => monitor.performance.clearHistory()}
          />
        )
      }
      caption={FPS_CAPTION[tone]}
      chart={<MetricSpark color={fpsColor(fps)} data={toChartData(history, fps)} />}
      details={
        <MetricList
          emptyText={
            loafSupported
              ? 'No long frames yet'
              : 'Long Animation Frames are not supported in this browser'
          }
          items={frames.map((frame) => ({
            id: `${frame.startTime}`,
            ...describeFrame(frame),
            trailing: `${Math.round(frame.blockingDuration)}ms`,
            tone: blockingTone(frame.blockingDuration),
            ratio: loaf.maxBlockingDuration ? frame.blockingDuration / loaf.maxBlockingDuration : 0,
          }))}
          title={
            loaf.count > 0
              ? `Long frames · ${Math.round(loaf.totalBlockingDuration)}ms blocked`
              : 'Long frames'
          }
        />
      }
      label={label}
      stats={[
        { label: 'Min', value: summary ? Math.round(summary.min) : '—' },
        { label: 'Avg', value: summary ? Math.round(summary.avg) : '—' },
        { label: 'Long frames', value: loafSupported ? loaf.count : '—', tone: worstTone },
        { label: 'CLS', value: performance.cls.toFixed(3), tone: clsTone(performance.cls) },
      ]}
      tone={tone}
      unit="fps"
      value={fps}
    />
  );
};
