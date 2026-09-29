import { Button, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import '../../styles/tokens.css';
import './Dashboard.css';
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
import { EventsLog } from './EventsLog';
import { NetworkLog } from './NetworkLog';

export interface DashboardProps {
  monitor: Monitor;
  onBack?: () => void;
  title?: string;
  showErrors?: boolean;
  showReporter?: boolean;
  allowClearErrors?: boolean;
  allowFlushReport?: boolean;
}

/**
 * Full view built from the metric widgets. Featured widgets span two grid columns when the
 * dashboard is wide enough, which turns them into their lg layout with the drill-down panel.
 */
export const Dashboard = ({
  monitor,
  onBack,
  title = 'Dashboard',
  showErrors = true,
  showReporter = true,
  allowClearErrors = false,
  allowFlushReport = false,
}: DashboardProps) => {
  return (
    <div className="monitor-dashboard">
      <div className="monitor-dashboard__header">
        <div className="monitor-dashboard__title-group">
          <Text className="monitor-dashboard__title" variant="caption-heading">
            {title}
          </Text>
          <DeviceStatus monitor={monitor} />
        </div>
        {onBack && (
          <Button onClick={onBack} size="sm" variant="flat">
            ← Back
          </Button>
        )}
      </div>

      <div className="monitor-dashboard__content">
        <div className="monitor-dashboard__metrics">
          <HealthMetric monitor={monitor} />
          <FpsMetric className="monitor-dashboard__featured" monitor={monitor} />
          <MemoryMetric monitor={monitor} />
          <NetworkMetric className="monitor-dashboard__featured" monitor={monitor} />
          <ResourcesMetric monitor={monitor} />
          <WebVitalsMetric className="monitor-dashboard__featured" monitor={monitor} />
          <EventsMetric monitor={monitor} />
          {showErrors && (
            <ErrorsMetric
              allowClear={allowClearErrors}
              className="monitor-dashboard__featured"
              monitor={monitor}
            />
          )}
          {showReporter && <ReporterMetric allowFlush={allowFlushReport} monitor={monitor} />}
          <ReactMetric monitor={monitor} />
        </div>
        <div className="monitor-dashboard__tables">
          <NetworkLog monitor={monitor} />
          <EventsLog monitor={monitor} />
        </div>
      </div>
    </div>
  );
};
