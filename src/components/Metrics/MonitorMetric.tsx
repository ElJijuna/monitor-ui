import { DeviceMetric } from './DeviceMetric';
import { ErrorsMetric } from './ErrorsMetric';
import { EventsMetric } from './EventsMetric';
import { FpsMetric } from './FpsMetric';
import { HealthMetric } from './HealthMetric';
import { MemoryMetric } from './MemoryMetric';
import { NetworkMetric } from './NetworkMetric';
import { ReactMetric } from './ReactMetric';
import { ReporterMetric } from './ReporterMetric';
import { ResourcesMetric } from './ResourcesMetric';
import type { ClearableMetricProps } from './types';
import { WebVitalsMetric } from './WebVitalsMetric';

export type MonitorMetricKind =
  | 'health'
  | 'fps'
  | 'memory'
  | 'network'
  | 'events'
  | 'errors'
  | 'resources'
  | 'webVitals'
  | 'react'
  | 'reporter'
  | 'device';

export const MONITOR_METRIC_KINDS: readonly MonitorMetricKind[] = [
  'health',
  'fps',
  'memory',
  'network',
  'events',
  'errors',
  'resources',
  'webVitals',
  'react',
  'reporter',
  'device',
];

export interface MonitorMetricProps extends ClearableMetricProps {
  metric: MonitorMetricKind;
  /** Only used by the `reporter` metric. */
  allowFlush?: boolean;
}

/** Renders any metric widget by name — handy for user-configurable layouts. */
export const MonitorMetric = ({ metric, allowClear, allowFlush, ...rest }: MonitorMetricProps) => {
  switch (metric) {
    case 'health':
      return <HealthMetric {...rest} />;
    case 'fps':
      return <FpsMetric {...rest} allowClear={allowClear} />;
    case 'memory':
      return <MemoryMetric {...rest} allowClear={allowClear} />;
    case 'network':
      return <NetworkMetric {...rest} allowClear={allowClear} />;
    case 'events':
      return <EventsMetric {...rest} allowClear={allowClear} />;
    case 'errors':
      return <ErrorsMetric {...rest} allowClear={allowClear} />;
    case 'resources':
      return <ResourcesMetric {...rest} allowClear={allowClear} />;
    case 'webVitals':
      return <WebVitalsMetric {...rest} allowClear={allowClear} />;
    case 'react':
      return <ReactMetric {...rest} allowClear={allowClear} />;
    case 'reporter':
      return <ReporterMetric {...rest} allowFlush={allowFlush} />;
    case 'device':
      return <DeviceMetric {...rest} />;
  }
};
