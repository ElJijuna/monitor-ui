import type { Monitor } from 'monitor-api'
import { useNetwork } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { SparkLineChart } from '@gnome-ui/charts'
import { formatBytes } from '../../utils/formatters'

interface PillNetworkViewProps {
  monitor: Monitor
}

export function PillNetworkView({ monitor }: PillNetworkViewProps) {
  const network = useNetwork(monitor)
  const latencyData = network.entries.length > 1
    ? network.entries.slice(-40).map((e) => e.latency)
    : [0, 0]
  const recentErrors = network.entries.filter(
    (e) => Date.now() - e.timestamp < 5000 && (e.error || e.status >= 400),
  ).length

  return (
    <>
      <span className="monitor-pill__metrics">
        <Text
          as="span"
          className="monitor-pill__primary"
          style={{ color: 'var(--monitor-color-latency, #a78bfa)' }}
          variant="numeric"
        >
          {network.window5s.count} req
        </Text>
        <Text as="span" className="monitor-pill__secondary" color="dim" variant="caption">
          {formatBytes(network.window5s.totalPayload)}
        </Text>
      </span>
      <span className="monitor-pill__chart" aria-hidden="true">
        <SparkLineChart
          color="var(--monitor-color-latency, #a78bfa)"
          data={latencyData}
          height={30}
          strokeWidth={1.5}
        />
      </span>
      <span className="monitor-pill__separator" aria-hidden="true" />
      <Text
        as="span"
        className="monitor-pill__trailing"
        color={recentErrors > 0 ? 'error' : 'dim'}
        variant="caption"
      >
        {recentErrors > 0 ? `${recentErrors} err` : '—'}
      </Text>
    </>
  )
}
