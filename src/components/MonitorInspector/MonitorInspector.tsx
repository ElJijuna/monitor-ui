import type { HTMLAttributes } from 'react'
import type { Monitor } from 'monitor-api'
import { Card } from '@gnome-ui/react'
import '../../styles/tokens.css'
import './MonitorInspector.css'
import { PerformanceSection } from './PerformanceSection'
import { WebVitalsSection } from './WebVitalsSection'
import { NetworkSection } from './NetworkSection'
import { ReactSection } from './ReactSection'
import { EventsSection } from './EventsSection'

export interface MonitorInspectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  monitor: Monitor
}

export function MonitorInspector({
  monitor,
  className,
  ...divProps
}: MonitorInspectorProps) {
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
  )
}
