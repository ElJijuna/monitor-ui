import { SparkAreaChart } from '@gnome-ui/charts';
import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { COLOR_LATENCY, COLOR_MEMORY } from '@/utils/colors';
import { CHART_HISTORY_POINTS } from '@/utils/constants';
import { fpsColor } from '@/utils/fpsColor';
import { selectNetworkEntries } from '@/utils/selectors';

interface ChartGridProps {
  monitor: Monitor;
}

export const ChartGrid = ({ monitor }: ChartGridProps) => {
  const performance = usePerformance(monitor);
  const networkEntries = useNetwork(monitor, selectNetworkEntries);
  const fpsChartColor = fpsColor(performance.fps);
  const latencyPoints = networkEntries.slice(-CHART_HISTORY_POINTS).map((e) => e.latency);

  const charts = [
    {
      label: 'FPS History',
      dataKey: 'fps' as const,
      data: toChartData(performance.fpsHistory, performance.fps),
      color: fpsChartColor,
    },
    {
      label: 'Heap used (%)',
      dataKey: 'memory' as const,
      data: performance.memory
        ? toChartData(performance.memoryHistory, performance.memory.percent)
        : [],
      color: COLOR_MEMORY,
    },
    {
      label: 'Request Latency (ms)',
      dataKey: 'latency' as const,
      data: toChartData(latencyPoints, latencyPoints[0] ?? 0),
      color: COLOR_LATENCY,
    },
  ];

  return (
    <div className="monitor-dashboard__charts">
      {charts.map(({ label, dataKey, data, color }) => (
        <div key={label} className="monitor-dashboard__chart-panel">
          <Text className="monitor-dashboard__chart-label" color="dim" variant="caption-heading">
            {label}
          </Text>
          {data.length > 0 ? (
            <SparkAreaChart
              color={color}
              data={data}
              dataKey={dataKey}
              height={64}
              strokeWidth={1.5}
            />
          ) : (
            <Text color="dim" variant="caption">
              No samples available
            </Text>
          )}
        </div>
      ))}
    </div>
  );
};
