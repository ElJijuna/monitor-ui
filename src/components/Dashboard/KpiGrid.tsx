import { SparkLineChart } from '@gnome-ui/charts';
import { StatCard } from '@gnome-ui/layout';
import type { Monitor } from 'monitor-api';
import { shallowEqual, useEvents, useNetwork, usePerformance } from 'monitor-api/react';
import { toChartData } from '@/utils/chartData';
import { COLOR_MEMORY } from '@/utils/colors';
import { fpsColor } from '@/utils/fpsColor';
import { selectEventCount, selectWindow5s } from '@/utils/selectors';

interface KpiGridProps {
  monitor: Monitor;
}

export const KpiGrid = ({ monitor }: KpiGridProps) => {
  const performance = usePerformance(monitor);
  const window5s = useNetwork(monitor, selectWindow5s, shallowEqual);
  const eventCount = useEvents(monitor, selectEventCount);
  const color = fpsColor(performance.fps);
  const latency = Math.round(window5s.avgLatency);
  const hasRequests = window5s.count > 0;

  return (
    <div className="monitor-dashboard__kpis">
      <StatCard
        backgroundChart={
          <span className="monitor-dashboard__spark" aria-hidden="true">
            {performance.fpsHistory.length > 0 && (
              <SparkLineChart
                color={color}
                data={toChartData(performance.fpsHistory, performance.fps)}
                height={38}
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
          <span className="monitor-dashboard__spark" aria-hidden="true">
            {performance.memory && performance.memoryHistory.length > 0 && (
              <SparkLineChart
                color={COLOR_MEMORY}
                data={toChartData(performance.memoryHistory, performance.memory.percent)}
                height={38}
              />
            )}
          </span>
        }
        label="JS Heap"
        unit={performance.memory ? 'MB' : ''}
        value={performance.memory ? Math.round(performance.memory.used) : '—'}
      />
      <StatCard
        label="Avg Latency"
        unit={hasRequests ? 'ms / 5s' : ''}
        value={hasRequests ? latency : '—'}
      />
      <StatCard label="Retained Events" value={eventCount} />
      <StatCard label="Long Tasks" value={performance.longTasks.count} />
      <StatCard
        label="Last Long Task"
        unit={performance.longTasks.lastDuration === null ? '' : 'ms'}
        value={
          performance.longTasks.lastDuration === null
            ? '—'
            : Math.round(performance.longTasks.lastDuration)
        }
      />
    </div>
  );
};
