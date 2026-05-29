import type { Monitor } from 'monitor-api'
import { useEvents } from 'monitor-api/react'
import { ActionRow, BoxedList, Text } from '@gnome-ui/react'
import { formatTime } from './formatters'
import { EmptyRow } from './EmptyRow'

interface EventsSectionProps {
  monitor: Monitor
}

export function EventsSection({ monitor }: EventsSectionProps) {
  const events = useEvents(monitor)
  const recentEvents = events.entries.slice(0, 6)

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        App Events
      </Text>
      <BoxedList>
        {recentEvents.length > 0 ? recentEvents.map((event) => (
          <ActionRow
            key={event.id}
            subtitle={formatTime(event.timestamp)}
            title={event.label}
          />
        )) : (
          <EmptyRow>No events</EmptyRow>
        )}
      </BoxedList>
    </section>
  )
}
