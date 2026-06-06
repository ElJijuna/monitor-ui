import { Card } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import type { HTMLAttributes } from 'react';
import '../../styles/tokens.css';
import './MonitorInspector.css';
import { EventsSection } from './EventsSection';
import { NetworkSection } from './NetworkSection';
import { PerformanceSection } from './PerformanceSection';
import { ReactSection } from './ReactSection';
import { WebVitalsSection } from './WebVitalsSection';

export interface MonitorInspectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  monitor: Monitor;
}

export const MonitorInspector = ({ monitor, className, ...divProps }: MonitorInspectorProps) => {
  return (
    <Card
      {...divProps}
      className={['monitor-inspector', className].filter(Boolean).join(' ')}
      padding="none"
    >
      <div className="monitor-inspector__content">
        <PerformanceSection monitor={monitor} />
        <WebVitalsSection monitor={monitor} />
        <NetworkSection monitor={monitor} />
        <ReactSection monitor={monitor} />
        <EventsSection monitor={monitor} />
      </div>
    </Card>
  );
};
