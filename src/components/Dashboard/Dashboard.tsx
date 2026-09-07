import { Button, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import '../../styles/tokens.css';
import '../MonitorInspector/MonitorInspector.css';
import './Dashboard.css';
import { ErrorsSection } from '@/components/MonitorInspector/ErrorsSection';
import { ReactSection } from '@/components/MonitorInspector/ReactSection';
import { ReporterSection } from '@/components/MonitorInspector/ReporterSection';
import { WebVitalsSection } from '@/components/MonitorInspector/WebVitalsSection';
import { ChartGrid } from './ChartGrid';
import { EventsLog } from './EventsLog';
import { KpiGrid } from './KpiGrid';
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
        <ReactSection monitor={monitor} />
        {showErrors && <ErrorsSection allowClear={allowClearErrors} monitor={monitor} />}
        {showReporter && <ReporterSection allowFlush={allowFlushReport} monitor={monitor} />}
        <div className="monitor-dashboard__tables">
          <NetworkLog monitor={monitor} />
          <EventsLog monitor={monitor} />
        </div>
      </div>
    </div>
  );
};
