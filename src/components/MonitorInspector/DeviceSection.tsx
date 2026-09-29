import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import type { DeviceSnapshot, Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';

interface DeviceSectionProps {
  monitor: Monitor;
}

const CONNECTION_LABELS = { online: 'Online', offline: 'Offline', unknown: 'Unknown' } as const;

function connectionState({ online }: DeviceSnapshot): keyof typeof CONNECTION_LABELS {
  if (online === null) {
    return 'unknown';
  }

  return online ? 'online' : 'offline';
}

/** Connectivity and capabilities from the device collector, to read the other metrics against. */
export const DeviceSection = ({ monitor }: DeviceSectionProps) => {
  const device = useDevice(monitor);
  const connection = connectionState(device);

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Device
      </Text>
      <BoxedList>
        <ActionRow
          subtitle={connection === 'online' ? 'A network is reachable' : undefined}
          title="Connection"
          trailing={
            <Text
              className="monitor-inspector__value"
              color={
                connection === 'offline' ? 'error' : connection === 'online' ? 'success' : 'dim'
              }
              variant="numeric"
            >
              {CONNECTION_LABELS[connection]}
            </Text>
          }
          variant="property"
        />
        <ActionRow
          subtitle="Since the monitor started"
          title="Went offline"
          trailing={
            <Text
              className="monitor-inspector__value"
              color={device.offlineCount > 0 ? 'error' : undefined}
              variant="numeric"
            >
              {device.offlineCount}
            </Text>
          }
          variant="property"
        />
        <ActionRow
          title="CPU cores"
          trailing={
            <Text className="monitor-inspector__value" variant="numeric">
              {device.hardwareConcurrency ?? '—'}
            </Text>
          }
          variant="property"
        />
      </BoxedList>
    </section>
  );
};
