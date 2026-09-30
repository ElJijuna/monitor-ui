import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import { connectionTone, formatBrowser } from '@/utils/device';
import './DeviceStatus.css';

interface DeviceStatusProps {
  monitor: Monitor;
}

/**
 * Connectivity, connection quality, browser, CPU and RAM chips from the device collector;
 * nothing until it reports. Chips for values the browser does not expose are left out.
 */
export const DeviceStatus = ({ monitor }: DeviceStatusProps) => {
  const { online, hardwareConcurrency, deviceMemory, offlineCount, browser, connection } =
    useDevice(monitor);
  const browserLabel = formatBrowser(browser);
  const quality = connectionTone(connection);

  if (online === null && hardwareConcurrency === null && browserLabel === null) {
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
      {/* A good estimate is not news; only a slow connection or data saver gets a chip. */}
      {online !== false && (quality === 'warn' || quality === 'bad' || connection.saveData) && (
        <Text
          as="span"
          className="monitor-device__chip"
          data-tone={quality === 'bad' ? 'bad' : 'warn'}
          variant="caption"
        >
          {[connection.effectiveType, connection.saveData && 'data saver']
            .filter(Boolean)
            .join(' · ')}
        </Text>
      )}
      {browserLabel !== null && (
        <Text as="span" className="monitor-device__chip" color="dim" variant="caption">
          {[browserLabel, browser.platform].filter(Boolean).join(' · ')}
        </Text>
      )}
      {hardwareConcurrency !== null && (
        <Text as="span" className="monitor-device__chip" color="dim" variant="caption">
          {hardwareConcurrency} cores
        </Text>
      )}
      {deviceMemory !== null && (
        <Text as="span" className="monitor-device__chip" color="dim" variant="caption">
          {deviceMemory} GB RAM
        </Text>
      )}
    </span>
  );
};
