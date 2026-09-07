import { Button, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useErrors } from 'monitor-api/react';
import { LOG_MAX_ENTRIES } from '@/utils/constants';
import { formatTime } from '@/utils/formatters';
import { EmptyRow } from './EmptyRow';

interface ErrorsSectionProps {
  monitor: Monitor;
  allowClear?: boolean;
}

export const ErrorsSection = ({ monitor, allowClear = false }: ErrorsSectionProps) => {
  const errors = useErrors(monitor);
  const entries = [...errors.entries].reverse().slice(0, LOG_MAX_ENTRIES);

  return (
    <section className="monitor-inspector__section">
      <div className="monitor-section__header">
        <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
          Errors
        </Text>
        {allowClear && (
          <Button
            disabled={entries.length === 0}
            onClick={() => monitor.errors.clearLog()}
            size="sm"
            variant="flat"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="monitor-section__summary">
        <Text variant="numeric">{errors.totalErrors} total</Text>
        <Text color="dim" variant="caption">
          {errors.droppedErrors} dropped
        </Text>
      </div>
      <div className="monitor-diagnostics__rows">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <details className="monitor-diagnostics__entry" key={entry.id}>
              <summary>
                <Text as="span" color="error" variant="caption">
                  {entry.source}
                </Text>
                <Text as="span" className="monitor-diagnostics__message">
                  {entry.details.message}
                </Text>
                <Text as="span" color="dim" variant="caption">
                  ×{entry.occurrences} · {formatTime(entry.lastSeenAt)}
                </Text>
              </summary>
              <pre>{entry.details.stack ?? `${entry.details.name}: ${entry.details.message}`}</pre>
            </details>
          ))
        ) : (
          <EmptyRow>No error records available</EmptyRow>
        )}
      </div>
    </section>
  );
};
