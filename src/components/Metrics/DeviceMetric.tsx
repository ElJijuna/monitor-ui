import type { DeviceSnapshot } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import {
  connectionTone,
  formatBrowser,
  formatConnection,
  formatPlatform,
  formatScreen,
  formatSize,
} from '@/utils/device';
import { MetricCard } from './MetricCard';
import { MetricList, type MetricListItem } from './MetricList';
import type { MetricBaseProps, MetricTone } from './types';

export type DeviceMetricProps = MetricBaseProps;

/** Whether the device collector has read anything yet (it reports nulls before `start()`). */
function isReported(device: DeviceSnapshot): boolean {
  return (
    device.online !== null || device.hardwareConcurrency !== null || device.browser.name !== null
  );
}

function deviceTone(device: DeviceSnapshot): MetricTone {
  if (!isReported(device)) {
    return 'neutral';
  }

  if (device.online === false) {
    return 'bad';
  }

  return connectionTone(device.connection) ?? 'good';
}

function onlineRow({ online, offlineCount }: DeviceSnapshot): MetricListItem | null {
  if (online === null) {
    return null;
  }

  const drops = offlineCount > 0 ? `${offlineCount} drop${offlineCount === 1 ? '' : 's'}` : null;

  return {
    id: 'online',
    primary: [online ? 'Online' : 'Offline', drops].filter(Boolean).join(' · '),
    secondary: 'Connectivity',
    tone: online ? 'good' : 'bad',
  };
}

function environmentRows(device: DeviceSnapshot): MetricListItem[] {
  const connectionQuality = connectionTone(device.connection);
  const rows: (MetricListItem | null)[] = [
    onlineRow(device),
    row('connection', 'Network estimate', formatConnection(device.connection), connectionQuality),
    row('browser', 'Browser', formatBrowser(device.browser)),
    row('platform', 'Operating system', formatPlatform(device.browser)),
    row('screen', 'Screen', formatScreen(device.screen)),
    row('viewport', 'Viewport', formatSize(device.viewport)),
    row('language', 'Language', device.language),
    row('time-zone', 'Time zone', device.timeZone),
    row('color-scheme', 'Color scheme', device.colorScheme),
    row(
      'motion',
      'Motion',
      device.reducedMotion === null ? null : device.reducedMotion ? 'reduced' : 'no preference',
    ),
  ];

  return rows.filter((item): item is MetricListItem => item !== null);
}

function row(
  id: string,
  label: string,
  value: string | null,
  tone?: MetricTone | null,
): MetricListItem | null {
  return value === null ? null : { id, primary: value, secondary: label, tone: tone ?? undefined };
}

/**
 * Where the page runs, from the device collector: browser and OS as the value, flagged when the
 * browser is offline or estimates a slow connection. lg lists the whole environment (screen,
 * viewport, language, time zone, color scheme, motion preference…). Fields the browser does not
 * expose are left out.
 */
export const DeviceMetric = ({ monitor, label = 'Device', ...rest }: DeviceMetricProps) => {
  const device = useDevice(monitor);
  const reported = isReported(device);
  const tone = deviceTone(device);
  const { hardwareConcurrency, deviceMemory, connection } = device;
  const networkQuality = connectionTone(connection);

  let caption = 'waiting';

  if (device.online === false) {
    caption = 'offline';
  } else if (reported) {
    caption = formatPlatform(device.browser) ?? 'unknown platform';
  }

  return (
    <MetricCard
      {...rest}
      caption={caption}
      details={
        <MetricList
          emptyText="Not reported yet"
          items={environmentRows(device)}
          title="Environment"
        />
      }
      label={label}
      stats={[
        { label: 'Cores', value: hardwareConcurrency ?? '—' },
        { label: 'RAM', value: deviceMemory === null ? '—' : `${deviceMemory} GB` },
        { label: 'Viewport', value: formatSize(device.viewport) ?? '—' },
        {
          label: 'Network',
          value: connection.effectiveType ?? '—',
          tone: networkQuality === 'good' ? undefined : (networkQuality ?? undefined),
        },
      ]}
      tone={tone}
      value={formatBrowser(device.browser) ?? '—'}
    />
  );
};
