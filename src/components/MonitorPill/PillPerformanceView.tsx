import { SparkLineChart } from '@gnome-ui/charts';
import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { formatMemory } from '@/utils/formatters';
import { fpsColor } from '@/utils/fpsColor';

interface PillPerformanceViewProps {
  monitor: Monitor;
}

export const PillPerformanceView = ({ monitor }: PillPerformanceViewProps) => {
  const performance = usePerformance(monitor);
  const network = useNetwork(monitor);
  const color = fpsColor(performance.fps);
  const memory = formatMemory(performance.memory);
  const chartData = toChartData(performance.fpsHistory, performance.fps);

  return (
    <>
      <span className="monitor-pill__metrics">
        <Text as="span" className="monitor-pill__primary" style={{ color }} variant="numeric">
          {Math.round(performance.fps)} fps
        </Text>
        <Text as="span" className="monitor-pill__secondary" color="dim" variant="caption">
          {memory.value}
          {memory.unit ? ` ${memory.unit}` : ''}
        </Text>
      </span>
      <span className="monitor-pill__chart" aria-hidden="true">
        <SparkLineChart color={color} data={chartData} height={30} strokeWidth={1.5} />
      </span>
      <span className="monitor-pill__separator" aria-hidden="true" />
      <Text as="span" className="monitor-pill__trailing" color="accent" variant="caption">
        {network.window5s.avgLatency > 0 ? `${Math.round(network.window5s.avgLatency)}ms` : '—'}
      </Text>
    </>
  );
};
