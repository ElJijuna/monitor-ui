import type { Monitor } from 'monitor-api'
import { Button, Drawer, HeaderBar } from '@gnome-ui/react'
import type { DrawerProps } from '@gnome-ui/react'
import '../../styles/tokens.css'
import './MonitorInspector.css'
import { PerformanceSection } from './PerformanceSection'
import { WebVitalsSection } from './WebVitalsSection'
import { NetworkSection } from './NetworkSection'
import { ReactSection } from './ReactSection'
import { EventsSection } from './EventsSection'

export interface MonitorInspectorProps extends Omit<DrawerProps, 'children' | 'content'> {
  monitor: Monitor
  onOpenDashboard?: () => void
}

export function MonitorInspector({
  monitor,
  open,
  onClose,
  onOpenDashboard,
  side = 'right',
  size = 'classic',
  title = 'Monitor',
  ...drawerProps
}: MonitorInspectorProps) {
  return (
    <Drawer
      {...drawerProps}
      className="monitor-inspector"
      onClose={onClose}
      open={open}
      side={side}
      size={size}
    >
      <HeaderBar
        end={(
          <>
            {onOpenDashboard ? (
              <Button onClick={onOpenDashboard} size="sm" variant="flat">
                Dashboard
              </Button>
            ) : null}
            <Button onClick={onClose} size="sm" variant="flat">
              Close
            </Button>
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
    </Drawer>
  )
}
