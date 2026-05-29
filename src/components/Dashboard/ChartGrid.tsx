import type { Monitor } from 'monitor-api'
import { useNetwork, usePerformance } from 'monitor-api/react'
import { SparkAreaChart } from '@gnome-ui/charts'
import { Text } from '@gnome-ui/react'
import { fpsColor } from '../../utils/fpsColor'

interface ChartGridProps {
  monitor: Monitor
}

export function ChartGrid({ monitor }: ChartGridProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const fpsChartColor = fpsColor(performance.fps)
  const latencyPoints = network.entries.slice(-60).map((e) => e.latency)

  const charts = [
    {
      label: 'FPS History',
      data: performance.fpsHistory.length > 1 ? performance.fpsHistory : [performance.fps, performance.fps],
      color: fpsChartColor,
    },
    {
      label: 'Memory (MB)',
      data: performance.memoryHistory.length > 1 ? performance.memoryHistory : [0, performance.memory?.used ?? 0],
      color: 'var(--monitor-color-memory, #60a5fa)',
    },
    {
      label: 'Request Latency (ms)',
      data: latencyPoints.length > 1 ? latencyPoints : [0, 0],
      color: 'var(--monitor-color-latency, #a78bfa)',
    },
  ]

  return (
    <div className="monitor-dashboard__charts">
      {charts.map(({ label, data, color }) => (
        <div key={label} className="monitor-dashboard__chart-panel">
          <Text className="monitor-dashboard__chart-label" color="dim" variant="caption-heading">
            {label}
          </Text>
          <SparkAreaChart color={color} data={data} height={64} strokeWidth={1.5} />
        </div>
      ))}
    </div>
  )
}
