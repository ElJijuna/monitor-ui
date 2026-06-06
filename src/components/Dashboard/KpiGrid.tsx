import { SparkLineChart } from '@gnome-ui/charts';
import { StatCard } from '@gnome-ui/layout';
import type { Monitor } from 'monitor-api';
import { useEvents, useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '../../utils/chartData';
import { COLOR_MEMORY } from '../../utils/colors';
import { fpsColor } from '../../utils/fpsColor';

interface KpiGridProps {
  monitor: Monitor;
}

export const KpiGrid = ({ monitor }: KpiGridProps) => {
  const performance = usePerformance(monitor);
  const network = useNetwork(monitor);
  const events = useEvents(monitor);
  const color = fpsColor(performance.fps);
  const latency = Math.round(network.window5s.avgLatency);

  return (
    <div className="monitor-dashboard__kpis">
      <StatCard
        backgroundChart={
          <span className="monitor-dashboard__spark" aria-hidden="true">
            <SparkLineChart
              color={color}
              data={toChartData(performance.fpsHistory, performance.fps)}
              height={38}
            />
          </span>
        }
        label="FPS"
        unit="fps"
        value={Math.round(performance.fps)}
      />
      <StatCard
        backgroundChart={
          <span className="monitor-dashboard__spark" aria-hidden="true">
            <SparkLineChart
              color={COLOR_MEMORY}
              data={toChartData(performance.memoryHistory, performance.memory?.used ?? 0)}
              height={38}
            />
          </span>
        }
        label="JS Heap"
        unit={performance.memory ? 'MB' : ''}
        value={performance.memory ? Math.round(performance.memory.used) : '—'}
      />
      <StatCard
        label="Avg Latency"
        unit={latency > 0 ? 'ms' : ''}
        value={latency > 0 ? latency : '—'}
      />
      <StatCard label="App Events" value={events.entries.length} />
    </div>
  );
};
