import type { Monitor } from 'monitor-api'
import { useEvents, useNetwork, usePerformance } from 'monitor-api/react'
import { StatCard } from '@gnome-ui/layout'
import { SparkLineChart } from '@gnome-ui/charts'
import { fpsColor } from '../../utils/fpsColor'

interface KpiGridProps {
  monitor: Monitor
}

export function KpiGrid({ monitor }: KpiGridProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const events = useEvents(monitor)
  const color = fpsColor(performance.fps)
  const latency = Math.round(network.window5s.avgLatency)

  return (
    <div className="monitor-dashboard__kpis">
      <StatCard
        backgroundChart={(
          <span className="monitor-dashboard__spark" aria-hidden="true">
            <SparkLineChart
              color={color}
              data={performance.fpsHistory.length > 1 ? performance.fpsHistory : [performance.fps, performance.fps]}
              height={38}
            />
          </span>
        )}
        label="FPS"
        unit="fps"
        value={Math.round(performance.fps)}
      />
      <StatCard
        backgroundChart={(
          <span className="monitor-dashboard__spark" aria-hidden="true">
            <SparkLineChart
              color="var(--monitor-color-memory, #60a5fa)"
              data={performance.memoryHistory.length > 1 ? performance.memoryHistory : [0, performance.memory?.used ?? 0]}
              height={38}
            />
          </span>
        )}
        label="JS Heap"
        unit={performance.memory ? 'MB' : ''}
        value={performance.memory ? Math.round(performance.memory.used) : '—'}
      />
      <StatCard
        label="Avg Latency"
        unit={latency > 0 ? 'ms' : ''}
        value={latency > 0 ? latency : '—'}
      />
      <StatCard
        label="App Events"
        value={events.entries.length}
      />
    </div>
  )
}
