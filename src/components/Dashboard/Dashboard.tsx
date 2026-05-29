import type { Monitor } from 'monitor-api'
import { Button, Text } from '@gnome-ui/react'
import '../../styles/tokens.css'
import './Dashboard.css'
import { KpiGrid } from './KpiGrid'
import { ChartGrid } from './ChartGrid'
import { NetworkLog } from './NetworkLog'
import { EventsLog } from './EventsLog'
import { WebVitalsSection } from '../MonitorInspector/WebVitalsSection'

export interface DashboardProps {
  monitor: Monitor
  onBack?: () => void
  title?: string
}

export function Dashboard({ monitor, onBack, title = 'Dashboard' }: DashboardProps) {
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
  )
}
