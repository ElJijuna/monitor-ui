import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import './DeviceStatus.css';

interface DeviceStatusProps {
  monitor: Monitor;
}

/** Connectivity and CPU chips from the device collector; nothing until it reports. */
export const DeviceStatus = ({ monitor }: DeviceStatusProps) => {
  const { online, hardwareConcurrency, offlineCount } = useDevice(monitor);

  if (online === null && hardwareConcurrency === null) {
    return null;
  }

  return (
    <span className="monitor-device">
      {online !== null && (
        <Text
          as="span"
          className="monitor-device__chip"
          data-tone={online ? 'good' : 'bad'}
          variant="caption"
        >
          {online ? 'Online' : 'Offline'}
          {offlineCount > 0 && ` · ${offlineCount} drop${offlineCount === 1 ? '' : 's'}`}
        </Text>
      )}
      {hardwareConcurrency !== null && (
        <Text as="span" className="monitor-device__chip" color="dim" variant="caption">
          {hardwareConcurrency} cores
        </Text>
      )}
    </span>
  );
};
