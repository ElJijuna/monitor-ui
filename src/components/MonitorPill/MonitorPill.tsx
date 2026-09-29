import { Card, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import type { ComponentPropsWithoutRef } from 'react';
import { selectOnline } from '@/utils/selectors';
import '../../styles/tokens.css';
import './MonitorPill.css';
import { PillErrorsView } from './PillErrorsView';
import { PillEventsView } from './PillEventsView';
import { PillNetworkView } from './PillNetworkView';
import { PillPerformanceView } from './PillPerformanceView';

export type MonitorPillScope = 'performance' | 'network' | 'events' | 'errors';

export interface MonitorPillProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  monitor: Monitor;
  scope?: MonitorPillScope;
  label?: string;
}

export const MonitorPill = ({
  monitor,
  scope = 'performance',
  label = 'Open monitor',
  className,
  style,
  ...buttonProps
}: MonitorPillProps) => {
  // Shown in every scope: being offline explains failed requests and stale values.
  const offline = useDevice(monitor, selectOnline) === false;
  const accessibleName = buttonProps['aria-label'] ?? label;

  return (
    <Card
      {...buttonProps}
      aria-label={offline ? `${accessibleName}, offline` : accessibleName}
      as="button"
      className={['monitor-pill', className].filter(Boolean).join(' ')}
      interactive
      padding="sm"
      style={style}
    >
      {scope === 'performance' && <PillPerformanceView monitor={monitor} />}
      {scope === 'network' && <PillNetworkView monitor={monitor} />}
      {scope === 'events' && <PillEventsView monitor={monitor} />}
      {scope === 'errors' && <PillErrorsView monitor={monitor} />}
      {offline && (
        <>
          <span aria-hidden="true" className="monitor-pill__separator" />
          <Text as="span" className="monitor-pill__offline" color="error" variant="caption">
            offline
          </Text>
        </>
      )}
    </Card>
  );
};
