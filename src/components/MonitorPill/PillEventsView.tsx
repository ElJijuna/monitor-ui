import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useEvents } from 'monitor-api/react';
import { COLOR_EVENTS } from '@/utils/colors';
import { formatTime } from '@/utils/formatters';

const LABEL_MAX_LENGTH = 16;

interface PillEventsViewProps {
  monitor: Monitor;
}

export const PillEventsView = ({ monitor }: PillEventsViewProps) => {
  const events = useEvents(monitor);
  const lastEvent = events.entries[0];
  const shortLabel = lastEvent
    ? lastEvent.label.length > LABEL_MAX_LENGTH
      ? `${lastEvent.label.slice(0, LABEL_MAX_LENGTH - 2)}…`
      : lastEvent.label
    : 'no events';

  return (
    <>
      <span className="monitor-pill__metrics monitor-pill__metrics--wide">
        <Text
          as="span"
          className="monitor-pill__primary"
          style={{ color: COLOR_EVENTS }}
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
  );
};
