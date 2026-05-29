import type { Monitor } from 'monitor-api'
import { useNetwork, usePerformance } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { SparkLineChart } from '@gnome-ui/charts'
import { fpsColor } from '../../utils/fpsColor'
import { formatMemory } from '../../utils/formatters'

interface PillPerformanceViewProps {
  monitor: Monitor
}

export function PillPerformanceView({ monitor }: PillPerformanceViewProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const color = fpsColor(performance.fps)
  const memory = formatMemory(performance.memory)
  const chartData = performance.fpsHistory.length > 1
    ? performance.fpsHistory
    : [performance.fps, performance.fps]

  return (
    <>
      <span className="monitor-pill__metrics">
        <Text as="span" className="monitor-pill__primary" style={{ color }} variant="numeric">
          {Math.round(performance.fps)} fps
        </Text>
        <Text as="span" className="monitor-pill__secondary" color="dim" variant="caption">
          {memory.value}{memory.unit ? ` ${memory.unit}` : ''}
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
  )
}
