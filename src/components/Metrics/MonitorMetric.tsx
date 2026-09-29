import { ErrorsMetric } from './ErrorsMetric';
import { EventsMetric } from './EventsMetric';
import { FpsMetric } from './FpsMetric';
import { MemoryMetric } from './MemoryMetric';
import { NetworkMetric } from './NetworkMetric';
import { ReactMetric } from './ReactMetric';
import { ReporterMetric } from './ReporterMetric';
import type { ClearableMetricProps } from './types';
import { WebVitalsMetric } from './WebVitalsMetric';

export type MonitorMetricKind =
  | 'fps'
  | 'memory'
  | 'network'
  | 'events'
  | 'errors'
  | 'webVitals'
  | 'react'
  | 'reporter';

export const MONITOR_METRIC_KINDS: readonly MonitorMetricKind[] = [
  'fps',
  'memory',
  'network',
  'events',
  'errors',
  'webVitals',
  'react',
  'reporter',
];

export interface MonitorMetricProps extends ClearableMetricProps {
  metric: MonitorMetricKind;
  /** Only used by the `reporter` metric. */
  allowFlush?: boolean;
}

/** Renders any metric widget by name — handy for user-configurable layouts. */
export const MonitorMetric = ({ metric, allowClear, allowFlush, ...rest }: MonitorMetricProps) => {
  switch (metric) {
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
    case 'webVitals':
      return <WebVitalsMetric {...rest} allowClear={allowClear} />;
    case 'react':
      return <ReactMetric {...rest} allowClear={allowClear} />;
    case 'reporter':
      return <ReporterMetric {...rest} allowFlush={allowFlush} />;
  }
};
