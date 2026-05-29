import type { Monitor } from 'monitor-api'
import { useNetwork, usePerformance } from 'monitor-api/react'
import { SparkAreaChart } from '@gnome-ui/charts'
import { Text } from '@gnome-ui/react'
import { fpsColor } from '../../utils/fpsColor'
import { toChartData } from '../../utils/chartData'
import { COLOR_MEMORY, COLOR_LATENCY } from '../../utils/colors'
import { CHART_HISTORY_POINTS } from '../../utils/constants'

interface ChartGridProps {
  monitor: Monitor
}

export function ChartGrid({ monitor }: ChartGridProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const fpsChartColor = fpsColor(performance.fps)
  const latencyPoints = network.entries.slice(-CHART_HISTORY_POINTS).map((e) => e.latency)

  const charts = [
    {
      label: 'FPS History',
      dataKey: 'fps' as const,
      data: toChartData(performance.fpsHistory, performance.fps),
      color: fpsChartColor,
    },
    {
      label: 'Memory (MB)',
      dataKey: 'memory' as const,
      data: toChartData(performance.memoryHistory, performance.memory?.used ?? 0),
      color: COLOR_MEMORY,
    },
    {
      label: 'Request Latency (ms)',
      dataKey: 'latency' as const,
      data: latencyPoints.length > 1 ? latencyPoints : [0, 0],
      color: COLOR_LATENCY,
    },
  ]

  return (
    <div className="monitor-dashboard__charts">
      {charts.map(({ label, dataKey, data, color }) => (
        <div key={label} className="monitor-dashboard__chart-panel">
          <Text className="monitor-dashboard__chart-label" color="dim" variant="caption-heading">
            {label}
          </Text>
          <SparkAreaChart color={color} data={data} dataKey={dataKey} height={64} strokeWidth={1.5} />
        </div>
      ))}
    </div>
  )
}
