import { Card, Text } from '@gnome-ui/react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import '../../styles/tokens.css';
import './Metrics.css';
import type { MetricSize, MetricTone } from './types';

export interface MetricStat {
  label: string;
  value: ReactNode;
  tone?: MetricTone;
}

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'children'> {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: MetricTone;
  /** Accent color used while the tone is `neutral`. Any CSS color, including `var(...)`. */
  accent?: string;
  /** Short status text next to the label (sm and up). */
  caption?: ReactNode;
  /** Trend visualization (hidden while the widget has no samples). */
  chart?: ReactNode;
  /** Secondary figures (md and up). */
  stats?: MetricStat[];
  /** Drill-down content (lg only). */
  details?: ReactNode;
  /** Header action such as a Clear button (md and up). */
  action?: ReactNode;
  size?: MetricSize;
}

/**
 * Presentational shell shared by every metric widget.
 *
 * The root element is an inline-size container; the inner surface switches between
 * the pill, sm, md and lg layouts with `@container` queries, so the same markup
 * adapts to whatever slot the host application gives it.
 */
export const MetricCard = ({
  label,
  value,
  unit,
  tone = 'neutral',
  accent,
  caption,
  chart,
  stats = [],
  details,
  action,
  size = 'auto',
  className,
  style,
  ...fieldsetProps
}: MetricCardProps) => {
  const rootStyle = accent
    ? ({ ...style, '--monitor-metric-accent': accent } as CSSProperties)
    : style;

  return (
    // <fieldset> carries the implicit `group` role; Metrics.css resets its UA styles.
    <fieldset
      aria-label={label}
      {...fieldsetProps}
      className={['monitor-metric', className].filter(Boolean).join(' ')}
      data-size={size}
      data-tone={tone}
      style={rootStyle}
    >
      <Card
        as="div"
        className="monitor-metric__surface"
        data-details={details ? '' : undefined}
        padding="none"
      >
        <div className="monitor-metric__header">
          <span aria-hidden="true" className="monitor-metric__dot" />
          <Text as="span" className="monitor-metric__label" color="dim" variant="caption-heading">
            {label}
          </Text>
          {caption !== undefined && caption !== null && (
            <Text as="span" className="monitor-metric__caption" variant="caption">
              {caption}
            </Text>
          )}
          {action && <span className="monitor-metric__action">{action}</span>}
        </div>

        <div className="monitor-metric__value">
          <Text as="span" className="monitor-metric__number" variant="numeric">
            {value}
          </Text>
          {unit && (
            <Text as="span" className="monitor-metric__unit" color="dim" variant="caption">
              {unit}
            </Text>
          )}
        </div>

        {chart && (
          <div aria-hidden="true" className="monitor-metric__chart">
            {chart}
          </div>
        )}

        {stats.length > 0 && (
          <dl className="monitor-metric__stats">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="monitor-metric__stat"
                data-tone={stat.tone ?? undefined}
              >
                <Text as="dt" className="monitor-metric__stat-label" color="dim" variant="caption">
                  {stat.label}
                </Text>
                <Text as="dd" className="monitor-metric__stat-value" variant="numeric">
                  {stat.value}
                </Text>
              </div>
            ))}
          </dl>
        )}

        {details && <div className="monitor-metric__details">{details}</div>}
      </Card>
    </fieldset>
  );
};
