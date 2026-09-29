import { SparkLineChart } from '@gnome-ui/charts';
import { StatCard } from '@gnome-ui/layout';
import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { shallowEqual, useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { COLOR_MEMORY } from '@/utils/colors';
import { fpsColor } from '@/utils/fpsColor';
import { selectWindow5s } from '@/utils/selectors';
import { formatMemory } from './formatters';

interface PerformanceSectionProps {
  monitor: Monitor;
}

export const PerformanceSection = ({ monitor }: PerformanceSectionProps) => {
  const performance = usePerformance(monitor);
  const window5s = useNetwork(monitor, selectWindow5s, shallowEqual);
  const fpsChartColor = fpsColor(performance.fps);
  const memory = formatMemory(performance.memory);
  const latency = Math.round(window5s.avgLatency);
  const hasRequests = window5s.count > 0;

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Performance
      </Text>
      <div className="monitor-inspector__stats">
        <StatCard
          backgroundChart={
            <span className="monitor-inspector__spark" aria-hidden="true">
              {performance.fpsHistory.length > 0 && (
                <SparkLineChart
                  color={fpsChartColor}
                  data={toChartData(performance.fpsHistory, performance.fps)}
                  height={34}
                />
              )}
            </span>
          }
          label="FPS"
          unit="fps"
          value={Math.round(performance.fps)}
        />
        <StatCard
          backgroundChart={
            <span className="monitor-inspector__spark" aria-hidden="true">
              {performance.memory && performance.memoryHistory.length > 0 && (
                <SparkLineChart
                  color={COLOR_MEMORY}
                  data={toChartData(performance.memoryHistory, performance.memory.percent)}
                  height={34}
                />
              )}
            </span>
          }
          label="JS Heap"
          unit={memory.unit}
          value={memory.value}
        />
        <StatCard label="Requests" unit="/ 5s" value={window5s.count} />
        <StatCard
          label="Latency"
          unit={hasRequests ? 'ms / 5s' : ''}
          value={hasRequests ? latency : '—'}
        />
        <StatCard label="Long Frames" value={performance.longAnimationFrames.count} />
        <StatCard
          label="Worst Blocking"
          unit={performance.longAnimationFrames.maxBlockingDuration === null ? '' : 'ms'}
          value={
            performance.longAnimationFrames.maxBlockingDuration === null
              ? '—'
              : Math.round(performance.longAnimationFrames.maxBlockingDuration)
          }
        />
      </div>
    </section>
  );
};
