import { SparkLineChart } from '@gnome-ui/charts';
import { StatCard } from '@gnome-ui/layout';
import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { COLOR_MEMORY } from '@/utils/colors';
import { fpsColor } from '@/utils/fpsColor';
import { formatMemory } from './formatters';

interface PerformanceSectionProps {
  monitor: Monitor;
}

export const PerformanceSection = ({ monitor }: PerformanceSectionProps) => {
  const performance = usePerformance(monitor);
  const network = useNetwork(monitor);
  const fpsChartColor = fpsColor(performance.fps);
  const memory = formatMemory(performance.memory);
  const latency = Math.round(network.window5s.avgLatency);

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Performance
      </Text>
      <div className="monitor-inspector__stats">
        <StatCard
          backgroundChart={
            <span className="monitor-inspector__spark" aria-hidden="true">
              <SparkLineChart
                color={fpsChartColor}
                data={toChartData(performance.fpsHistory, performance.fps)}
                height={34}
              />
            </span>
          }
          label="FPS"
          unit="fps"
          value={Math.round(performance.fps)}
        />
        <StatCard
          backgroundChart={
            <span className="monitor-inspector__spark" aria-hidden="true">
              <SparkLineChart
                color={COLOR_MEMORY}
                data={toChartData(performance.memoryHistory, performance.memory?.used ?? 0)}
                height={34}
              />
            </span>
          }
          label="JS Heap"
          unit={memory.unit}
          value={memory.value}
        />
        <StatCard label="Requests" unit="/ 5s" value={network.window5s.count} />
        <StatCard
          label="Latency"
          unit={latency > 0 ? 'ms' : ''}
          value={latency > 0 ? latency : '-'}
        />
      </div>
    </section>
  );
};
