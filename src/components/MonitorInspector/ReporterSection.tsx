import { Button, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useSignal } from 'monitor-api/react';
import { useState } from 'react';
import { formatTime } from '@/utils/formatters';

interface ReporterSectionProps {
  monitor: Monitor;
  allowFlush?: boolean;
}

export const ReporterSection = ({ monitor, allowFlush = false }: ReporterSectionProps) => {
  const reporter = useSignal(monitor.reporter.snapshot);
  const [flushing, setFlushing] = useState(false);
  const [result, setResult] = useState('');

  const flush = async () => {
    setFlushing(true);
    setResult('');
    try {
      setResult((await monitor.reporter.flush()) ? 'Report sent' : 'Report was not sent');
    } catch {
      setResult('Report failed');
    } finally {
      setFlushing(false);
    }
  };

  return (
    <section className="monitor-inspector__section">
      <div className="monitor-section__header">
        <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
          Reporter
        </Text>
        {allowFlush && (
          <Button
            disabled={reporter.status !== 'idle' || flushing}
            onClick={flush}
            size="sm"
            variant="flat"
          >
            {flushing ? 'Sending…' : 'Send now'}
          </Button>
        )}
      </div>
      <div className="monitor-section__summary">
        <Text variant="numeric">{reporter.status}</Text>
        <Text color="dim" variant="caption">
          {reporter.sent} sent · {reporter.failed} failed · {reporter.retries} retries ·{' '}
          {reporter.dropped} dropped
        </Text>
        <Text color="dim" variant="caption">
          Last success:{' '}
          {reporter.lastSuccessAt === null ? 'none' : formatTime(reporter.lastSuccessAt)} · Last
          failure: {reporter.lastFailure ?? 'none'}
        </Text>
      </div>
      <span aria-live="polite" className="monitor-diagnostics__announcement">
        {result}
      </span>
    </section>
  );
};
