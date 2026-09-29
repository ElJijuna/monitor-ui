import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useEvents } from 'monitor-api/react';
import { LOG_MAX_ENTRIES } from '@/utils/constants';
import { formatTime } from '@/utils/formatters';
import { selectEventEntries } from '@/utils/selectors';

interface EventsLogProps {
  monitor: Monitor;
}

export const EventsLog = ({ monitor }: EventsLogProps) => {
  const entries = useEvents(monitor, selectEventEntries);
  const recentEvents = entries.slice(0, LOG_MAX_ENTRIES);

  return (
    <div className="monitor-dashboard__log">
      <div className="monitor-dashboard__log-header">
        <Text color="dim" variant="caption-heading">
          App Events · retained records
        </Text>
      </div>
      <div className="monitor-dashboard__log-rows">
        {recentEvents.length > 0 ? (
          recentEvents.map((event) => (
            <div key={event.id} className="monitor-dashboard__log-row">
              <Text
                as="span"
                className="monitor-dashboard__log-time monitor-dashboard__value"
                color="dim"
                variant="numeric"
              >
                {formatTime(event.timestamp)}
              </Text>
              <Text as="span" className="monitor-dashboard__log-event" variant="caption">
                {event.label}
              </Text>
            </div>
          ))
        ) : (
          <div className="monitor-dashboard__log-empty">
            <Text color="dim" variant="caption">
              No event records available
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
