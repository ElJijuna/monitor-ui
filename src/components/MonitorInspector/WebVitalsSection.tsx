import { Text } from '@gnome-ui/react';
import type { Monitor, WebVitalName, WebVitalsSnapshot } from 'monitor-api';
import { useWebVitals } from 'monitor-api/react';
import { VITAL_ORDER } from './formatters';
import { VitalTile } from './VitalTile';

interface WebVitalsSectionProps {
  monitor: Monitor;
}

const VITAL_KEY_MAP: Record<WebVitalName, keyof Omit<WebVitalsSnapshot, 'entries'>> = {
  LCP: 'lcp',
  INP: 'inp',
  CLS: 'cls',
  FCP: 'fcp',
  TTFB: 'ttfb',
};

export const WebVitalsSection = ({ monitor }: WebVitalsSectionProps) => {
  const webVitals = useWebVitals(monitor);

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Web Vitals
      </Text>
      <ul className="monitor-inspector__vitals">
        {VITAL_ORDER.map((name) => (
          <VitalTile key={name} metric={webVitals[VITAL_KEY_MAP[name]]} name={name} />
        ))}
      </ul>
    </section>
  );
};
