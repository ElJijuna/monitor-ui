import { Button, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import '../../styles/tokens.css';
import './Dashboard.css';
import { WebVitalsSection } from '../MonitorInspector/WebVitalsSection';
import { ChartGrid } from './ChartGrid';
import { EventsLog } from './EventsLog';
import { KpiGrid } from './KpiGrid';
import { NetworkLog } from './NetworkLog';

export interface DashboardProps {
  monitor: Monitor;
  onBack?: () => void;
  title?: string;
}

export const Dashboard = ({ monitor, onBack, title = 'Dashboard' }: DashboardProps) => {
  return (
    <div className="monitor-dashboard">
      <div className="monitor-dashboard__header">
        <div className="monitor-dashboard__title-group">
          <span className="monitor-dashboard__live" aria-hidden="true" />
          <Text className="monitor-dashboard__title" variant="caption-heading">
            {title}
          </Text>
        </div>
        {onBack && (
          <Button onClick={onBack} size="sm" variant="flat">
            ← Back
          </Button>
        )}
      </div>

      <div className="monitor-dashboard__content">
        <KpiGrid monitor={monitor} />
        <ChartGrid monitor={monitor} />
        <WebVitalsSection monitor={monitor} />
        <div className="monitor-dashboard__tables">
          <NetworkLog monitor={monitor} />
          <EventsLog monitor={monitor} />
        </div>
      </div>
    </div>
  );
};
