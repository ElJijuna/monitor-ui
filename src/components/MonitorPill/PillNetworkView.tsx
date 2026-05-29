import type { Monitor } from 'monitor-api'
import { useNetwork } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { SparkLineChart } from '@gnome-ui/charts'
import { formatBytes } from '../../utils/formatters'
import { COLOR_LATENCY } from '../../utils/colors'
import { CHART_HISTORY_POINTS, RECENT_WINDOW_MS } from '../../utils/constants'

interface PillNetworkViewProps {
  monitor: Monitor
}

export function PillNetworkView({ monitor }: PillNetworkViewProps) {
  const network = useNetwork(monitor)
  const latencyPoints = network.entries.slice(-CHART_HISTORY_POINTS).map((e) => e.latency)
  const latencyData = latencyPoints.length > 1 ? latencyPoints : [0, 0]
  const recentErrors = network.entries.filter(
    (e) => Date.now() - e.timestamp < RECENT_WINDOW_MS && (e.error || e.status >= 400),
  ).length

  return (
    <>
      <span className="monitor-pill__metrics">
        <Text
          as="span"
          className="monitor-pill__primary"
          style={{ color: COLOR_LATENCY }}
          variant="numeric"
        >
          {network.window5s.count} req
        </Text>
        <Text as="span" className="monitor-pill__secondary" color="dim" variant="caption">
          {formatBytes(network.window5s.totalPayload)}
        </Text>
      </span>
      <span className="monitor-pill__chart" aria-hidden="true">
        <SparkLineChart color={COLOR_LATENCY} data={latencyData} height={30} strokeWidth={1.5} />
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
