import type { Monitor } from 'monitor-api'
import { useNetwork } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { formatBytes } from '../../utils/formatters'

interface NetworkLogProps {
  monitor: Monitor
}

export function NetworkLog({ monitor }: NetworkLogProps) {
  const network = useNetwork(monitor)
  const entries = [...network.entries].reverse().slice(0, 20)

  return (
    <div className="monitor-dashboard__log">
      <div className="monitor-dashboard__log-header">
        <Text color="dim" variant="caption-heading">Network Log</Text>
      </div>
      <div className="monitor-dashboard__log-rows">
        {entries.length > 0 ? entries.map((entry) => (
          <div key={entry.id} className="monitor-dashboard__log-row">
            <Text
              as="span"
              className="monitor-dashboard__log-status monitor-dashboard__value"
              color={entry.error || entry.status >= 400 ? 'error' : 'success'}
              variant="numeric"
            >
              {entry.status || 'ERR'}
            </Text>
            <Text as="span" className="monitor-dashboard__log-url" color="dim" variant="caption">
              {entry.url}
            </Text>
            <Text as="span" className="monitor-dashboard__log-meta" color="dim" variant="caption">
              {Math.round(entry.latency)}ms · {formatBytes(entry.payloadSize)}
            </Text>
          </div>
        )) : (
          <div className="monitor-dashboard__log-empty">
            <Text color="dim" variant="caption">No requests yet</Text>
          </div>
        )}
      </div>
    </div>
  )
}
