import type { Monitor } from 'monitor-api';
import type { HTMLAttributes } from 'react';

/**
 * Layout preset of a metric widget.
 *
 * - `auto` (default) fills its parent and picks the layout from the available width
 *   through container queries: pill < 240px ≤ sm < 380px ≤ md < 600px ≤ lg.
 * - `pill` | `sm` | `md` | `lg` pin the widget to that preset width (capped at 100%
 *   of the parent, so a preset can still degrade gracefully in a narrow slot).
 */
export type MetricSize = 'auto' | 'pill' | 'sm' | 'md' | 'lg';

/** Semantic status used to color the value, the status dot and the chart. */
export type MetricTone = 'neutral' | 'good' | 'warn' | 'bad';

/** Props shared by every standalone metric widget. */
export interface MetricBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  monitor: Monitor;
  size?: MetricSize;
  /** Overrides the default metric label. */
  label?: string;
}

/** Props for widgets backed by a collector that can clear its retained history. */
export interface ClearableMetricProps extends MetricBaseProps {
  /** Shows a Clear action (md and up) that clears the collector's retained history. */
  allowClear?: boolean;
}
