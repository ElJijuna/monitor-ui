import type { ComponentPropsWithoutRef, CSSProperties } from 'react'
import type { Monitor } from 'monitor-api'
import { useNetwork, usePerformance } from 'monitor-api/react'
import { Card, Text } from '@gnome-ui/react'
import { SparkLineChart } from '@gnome-ui/charts'
import { fpsColor } from '../../utils/fpsColor'
import '../../styles/tokens.css'
import './MonitorPill.css'

export interface MonitorPillProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  monitor: Monitor
  label?: string
}

type MonitorPillStyle = CSSProperties & {
  '--monitor-pill-fps-color'?: string
}

function formatMemory(memory: ReturnType<typeof usePerformance>['memory']): string {
  if (!memory) return 'n/a'
  return `${Math.round(memory.used)}mb`
}

function formatLatency(latency: number): string {
  return latency > 0 ? `${Math.round(latency)}ms` : '-'
}

export function MonitorPill({
  monitor,
  label = 'Open monitor',
  className,
  style,
  ...buttonProps
}: MonitorPillProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const color = fpsColor(performance.fps)
  const chartData = performance.fpsHistory.length > 1
    ? performance.fpsHistory
    : [performance.fps, performance.fps]
  const pillStyle: MonitorPillStyle = { ...style, '--monitor-pill-fps-color': color }

  return (
    <Card
      {...buttonProps}
      aria-label={buttonProps['aria-label'] ?? label}
      as="button"
      className={['monitor-pill', className].filter(Boolean).join(' ')}
      interactive
      padding="sm"
      style={pillStyle}
    >
      <span className="monitor-pill__metrics">
        <Text as="span" className="monitor-pill__fps" variant="numeric">
          {Math.round(performance.fps)} fps
        </Text>
        <Text as="span" className="monitor-pill__memory" color="dim" variant="caption">
          {formatMemory(performance.memory)}
        </Text>
      </span>

      <span className="monitor-pill__chart" aria-hidden="true">
        <SparkLineChart
          aria-label="FPS history"
          color={color}
          data={chartData}
          height={30}
          strokeWidth={1.5}
        />
      </span>

      <span className="monitor-pill__separator" aria-hidden="true" />

      <Text as="span" className="monitor-pill__latency" color="accent" variant="caption">
        {formatLatency(network.window5s.avgLatency)}
      </Text>
    </Card>
  )
}
