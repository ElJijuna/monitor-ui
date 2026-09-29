import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useEvents } from 'monitor-api/react';
import { INSPECTOR_MAX_EVENTS } from '@/utils/constants';
import { selectEventEntries } from '@/utils/selectors';
import { EmptyRow } from './EmptyRow';
import { formatTime } from './formatters';

interface EventsSectionProps {
  monitor: Monitor;
}

export const EventsSection = ({ monitor }: EventsSectionProps) => {
  const entries = useEvents(monitor, selectEventEntries);
  const recentEvents = entries.slice(0, INSPECTOR_MAX_EVENTS);

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        App Events
      </Text>
      <BoxedList>
        {recentEvents.length > 0 ? (
          recentEvents.map((event) => (
            <ActionRow key={event.id} subtitle={formatTime(event.timestamp)} title={event.label} />
          ))
        ) : (
          <EmptyRow>No events</EmptyRow>
        )}
      </BoxedList>
    </section>
  );
};
