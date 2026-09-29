import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import type { HTMLAttributes } from 'react';
import '../../styles/tokens.css';
import './MonitorPill.css';
import { MonitorMetric, type MonitorMetricKind } from '@/components/Metrics';
import { selectOnline } from '@/utils/selectors';

/** Any metric widget, plus `performance` (kept for compatibility, same as `fps`). */
export type MonitorPillScope = MonitorMetricKind | 'performance';

export interface MonitorPillProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick'> {
  monitor: Monitor;
  /** Metric shown in the pill. Defaults to `performance` (frame rate). */
  scope?: MonitorPillScope;
  /** Accessible name of the pill button. */
  label?: string;
  /** Called when the pill is clicked, typically to open the inspector. */
  onClick?: () => void;
}

/**
 * Clickable entry point: the `size="pill"` metric widget for `scope`, activated as a button.
 * Every metric widget has a pill, so every metric can be a scope.
 */
export const MonitorPill = ({
  monitor,
  scope = 'performance',
  label = 'Open monitor',
  onClick,
  className,
  'aria-label': ariaLabel,
  ...spanProps
}: MonitorPillProps) => {
  // Shown next to every scope: being offline explains failed requests and stale values.
  const offline = useDevice(monitor, selectOnline) === false;
  const accessibleName = ariaLabel ?? label;

  return (
    <span {...spanProps} className={['monitor-pill', className].filter(Boolean).join(' ')}>
      <MonitorMetric
        activateLabel={offline ? `${accessibleName}, offline` : accessibleName}
        metric={scope === 'performance' ? 'fps' : scope}
        monitor={monitor}
        onActivate={onClick ?? noop}
        size="pill"
      />
      {offline && (
        <Text as="span" className="monitor-pill__offline" color="error" variant="caption">
          offline
        </Text>
      )}
    </span>
  );
};

// A pill is always a button, even before the host wires a handler.
function noop() {}
