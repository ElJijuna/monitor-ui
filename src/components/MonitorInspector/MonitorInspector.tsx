import type { HTMLAttributes } from 'react'
import type { Monitor } from 'monitor-api'
import { Button, HeaderBar } from '@gnome-ui/react'
import '../../styles/tokens.css'
import './MonitorInspector.css'
import { PerformanceSection } from './PerformanceSection'
import { WebVitalsSection } from './WebVitalsSection'
import { NetworkSection } from './NetworkSection'
import { ReactSection } from './ReactSection'
import { EventsSection } from './EventsSection'

export interface MonitorInspectorProps extends HTMLAttributes<HTMLDivElement> {
  monitor: Monitor
  title?: string
  onClose?: () => void
  onOpenDashboard?: () => void
}

export function MonitorInspector({
  monitor,
  title = 'Monitor',
  onClose,
  onOpenDashboard,
  className,
  ...divProps
}: MonitorInspectorProps) {
  return (
    <div
      {...divProps}
      className={['monitor-inspector', className].filter(Boolean).join(' ')}
    >
      <HeaderBar
        end={(
          <>
            {onOpenDashboard ? (
              <Button onClick={onOpenDashboard} size="sm" variant="flat">
                Dashboard
              </Button>
            ) : null}
            {onClose ? (
              <Button onClick={onClose} size="sm" variant="flat">
                Close
              </Button>
            ) : null}
          </>
        )}
        title={title}
      />

      <div className="monitor-inspector__content">
        <PerformanceSection monitor={monitor} />
        <WebVitalsSection monitor={monitor} />
        <NetworkSection monitor={monitor} />
        <ReactSection monitor={monitor} />
        <EventsSection monitor={monitor} />
      </div>
    </div>
  )
}
