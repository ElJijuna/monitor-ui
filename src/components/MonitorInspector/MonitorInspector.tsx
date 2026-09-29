import { Card } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import type { HTMLAttributes } from 'react';
import '../../styles/tokens.css';
import './MonitorInspector.css';
import { DeviceSection } from './DeviceSection';
import { ErrorsSection } from './ErrorsSection';
import { EventsSection } from './EventsSection';
import { NetworkSection } from './NetworkSection';
import { PerformanceSection } from './PerformanceSection';
import { ReactSection } from './ReactSection';
import { ReporterSection } from './ReporterSection';
import { WebVitalsSection } from './WebVitalsSection';

export interface MonitorInspectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  monitor: Monitor;
  showErrors?: boolean;
  showReporter?: boolean;
  allowClearErrors?: boolean;
  allowFlushReport?: boolean;
}

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
        <PerformanceSection monitor={monitor} />
        <DeviceSection monitor={monitor} />
        <WebVitalsSection monitor={monitor} />
        <NetworkSection monitor={monitor} />
        <ReactSection monitor={monitor} />
        <EventsSection monitor={monitor} />
        {showErrors && <ErrorsSection allowClear={allowClearErrors} monitor={monitor} />}
        {showReporter && <ReporterSection allowFlush={allowFlushReport} monitor={monitor} />}
      </div>
    </Card>
  );
};
