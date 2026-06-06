import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useNetwork } from 'monitor-api/react';
import { INSPECTOR_MAX_REQUESTS } from '../../utils/constants';
import { EmptyRow } from './EmptyRow';
import { formatBytes } from './formatters';

interface NetworkSectionProps {
  monitor: Monitor;
}

export const NetworkSection = ({ monitor }: NetworkSectionProps) => {
  const network = useNetwork(monitor);
  const recentRequests = network.entries.slice(-INSPECTOR_MAX_REQUESTS).reverse();

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Recent Requests
      </Text>
      <BoxedList>
        {recentRequests.length > 0 ? (
          recentRequests.map((entry) => (
            <ActionRow
              key={entry.id}
              subtitle={`${entry.method} - ${formatBytes(entry.payloadSize)} - ${Math.round(entry.latency)}ms`}
              title={entry.url}
              trailing={
                <Text
                  className="monitor-inspector__value"
                  color={entry.error || entry.status >= 400 ? 'error' : 'success'}
                  variant="numeric"
                >
                  {entry.status || 'ERR'}
                </Text>
              }
            />
          ))
        ) : (
          <EmptyRow>No requests yet</EmptyRow>
        )}
      </BoxedList>
    </section>
  );
};
