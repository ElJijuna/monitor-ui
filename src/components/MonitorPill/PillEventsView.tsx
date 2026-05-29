import type { Monitor } from 'monitor-api'
import { useEvents } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { formatTime } from '../../utils/formatters'

interface PillEventsViewProps {
  monitor: Monitor
}

export function PillEventsView({ monitor }: PillEventsViewProps) {
  const events = useEvents(monitor)
  const lastEvent = events.entries[0]
  const shortLabel = lastEvent
    ? lastEvent.label.length > 16 ? `${lastEvent.label.slice(0, 14)}…` : lastEvent.label
    : 'no events'

  return (
    <>
      <span className="monitor-pill__metrics monitor-pill__metrics--wide">
        <Text
          as="span"
          className="monitor-pill__primary"
          style={{ color: 'var(--monitor-color-events, #f472b6)' }}
          variant="numeric"
        >
          {events.entries.length} evt
        </Text>
        <Text as="span" className="monitor-pill__secondary" color="dim" variant="caption">
          {shortLabel}
        </Text>
      </span>
      <span className="monitor-pill__separator" aria-hidden="true" />
      <Text as="span" className="monitor-pill__trailing" color="dim" variant="caption">
        {lastEvent ? formatTime(lastEvent.timestamp) : '—'}
      </Text>
    </>
  )
}
