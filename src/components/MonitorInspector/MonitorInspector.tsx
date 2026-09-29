import { Card } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import type { HTMLAttributes } from 'react';
import '../../styles/tokens.css';
import './MonitorInspector.css';
import { DeviceStatus } from '@/components/DeviceStatus';
import {
  ErrorsMetric,
  EventsMetric,
  FpsMetric,
  HealthMetric,
  MemoryMetric,
  NetworkMetric,
  ReactMetric,
  ReporterMetric,
  ResourcesMetric,
  WebVitalsMetric,
} from '@/components/Metrics';

export interface MonitorInspectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  monitor: Monitor;
  showErrors?: boolean;
  showReporter?: boolean;
  allowClearErrors?: boolean;
  allowFlushReport?: boolean;
}

/**
 * Detailed side panel: every metric widget, `expanded` so that even in a narrow panel each
 * one shows its stats and drill-down list stacked under the card. In a panel of 600px or
 * more, the widgets switch to their lg layout on their own.
 */
export const MonitorInspector = ({
  monitor,
  showErrors = true,
  showReporter = true,
  allowClearErrors = false,
  allowFlushReport = false,
  className,
  ...divProps
}: MonitorInspectorProps) => {
  return (
    <Card
      {...divProps}
      className={['monitor-inspector', className].filter(Boolean).join(' ')}
      padding="none"
    >
      <div className="monitor-inspector__content">
        <DeviceStatus monitor={monitor} />
        <HealthMetric expanded monitor={monitor} />
        <FpsMetric expanded monitor={monitor} />
        <MemoryMetric expanded monitor={monitor} />
        <WebVitalsMetric expanded monitor={monitor} />
        <NetworkMetric expanded monitor={monitor} />
        <ResourcesMetric expanded monitor={monitor} />
        <ReactMetric expanded monitor={monitor} />
        <EventsMetric expanded monitor={monitor} />
        {showErrors && <ErrorsMetric allowClear={allowClearErrors} expanded monitor={monitor} />}
        {showReporter && <ReporterMetric allowFlush={allowFlushReport} expanded monitor={monitor} />}
      </div>
    </Card>
  );
};
