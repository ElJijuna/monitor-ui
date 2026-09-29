import { Card, Text } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import type { MetricTone } from './types';

export interface MetricListItem {
  id: string;
  primary: ReactNode;
  leading?: ReactNode;
  secondary?: ReactNode;
  trailing?: ReactNode;
  tone?: MetricTone;
  /** 0–1 share rendered as a background bar behind the row. */
  ratio?: number;
  /** Extra content, such as a stack trace, revealed when the row is expanded. */
  expand?: ReactNode;
}

interface MetricListProps {
  title: string;
  items: MetricListItem[];
  emptyText?: string;
}

const RowContent = ({ item }: { item: MetricListItem }) => (
  <>
    {item.ratio !== undefined && (
      <span
        aria-hidden="true"
        className="monitor-metric__list-bar"
        style={{ inlineSize: `${Math.round(Math.min(Math.max(item.ratio, 0), 1) * 100)}%` }}
      />
    )}
    {item.leading !== undefined && (
      <Text as="span" className="monitor-metric__list-leading" variant="numeric">
        {item.leading}
      </Text>
    )}
    <span className="monitor-metric__list-text">
      <Text as="span" className="monitor-metric__list-primary" variant="caption">
        {item.primary}
      </Text>
      {item.secondary !== undefined && (
        <Text as="span" className="monitor-metric__list-secondary" color="dim" variant="caption">
          {item.secondary}
        </Text>
      )}
    </span>
    {item.trailing !== undefined && (
      <Text as="span" className="monitor-metric__list-trailing" color="dim" variant="numeric">
        {item.trailing}
      </Text>
    )}
  </>
);

/**
 * Compact list used for the drill-down panel of every metric widget, framed by a
 * transparent, border-only card. Rows with `expand` become native disclosures.
 */
export const MetricList = ({ title, items, emptyText = 'No records yet' }: MetricListProps) => (
  <Card as="div" className="monitor-metric__list-card" padding="none">
    <Text className="monitor-metric__details-title" color="dim" variant="caption-heading">
      {title}
    </Text>
    {items.length > 0 ? (
      <ul className="monitor-metric__list">
        {items.map((item) =>
          item.expand === undefined ? (
            <li key={item.id} className="monitor-metric__list-item" data-tone={item.tone}>
              <RowContent item={item} />
            </li>
          ) : (
            <li
              key={item.id}
              className="monitor-metric__list-item monitor-metric__list-item--expandable"
              data-tone={item.tone}
            >
              <details className="monitor-metric__list-disclosure">
                <summary className="monitor-metric__list-summary">
                  <RowContent item={item} />
                </summary>
                <div className="monitor-metric__list-expand">{item.expand}</div>
              </details>
            </li>
          ),
        )}
      </ul>
    ) : (
      <Text className="monitor-metric__list-empty" color="dim" variant="caption">
        {emptyText}
      </Text>
    )}
  </Card>
);
