import type { ComponentPropsWithoutRef } from 'react'
import type { Monitor } from 'monitor-api'
import { Card } from '@gnome-ui/react'
import '../../styles/tokens.css'
import './MonitorPill.css'
import { PillPerformanceView } from './PillPerformanceView'
import { PillNetworkView } from './PillNetworkView'
import { PillEventsView } from './PillEventsView'

export type MonitorPillScope = 'performance' | 'network' | 'events'

export interface MonitorPillProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  monitor: Monitor
  scope?: MonitorPillScope
  label?: string
}

export function MonitorPill({
  monitor,
  scope = 'performance',
  label = 'Open monitor',
  className,
  style,
  ...buttonProps
}: MonitorPillProps) {
  return (
    <Card
      {...buttonProps}
      aria-label={buttonProps['aria-label'] ?? label}
      as="button"
      className={['monitor-pill', className].filter(Boolean).join(' ')}
      interactive
      padding="sm"
      style={style}
    >
      {scope === 'performance' && <PillPerformanceView monitor={monitor} />}
      {scope === 'network' && <PillNetworkView monitor={monitor} />}
      {scope === 'events' && <PillEventsView monitor={monitor} />}
    </Card>
  )
}
