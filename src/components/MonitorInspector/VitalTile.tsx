import { Text } from '@gnome-ui/react';
import type { WebVitalMetric, WebVitalName } from 'monitor-api';
import { formatVital, VITAL_FULL_NAMES } from './formatters';

interface VitalTileProps {
  name: WebVitalName;
  metric: WebVitalMetric | null;
}

function ratingClass(rating: WebVitalMetric['rating']): string {
  if (rating === 'good') {
    return 'monitor-inspector__vital--good';
  }

  if (rating === 'needs-improvement') {
    return 'monitor-inspector__vital--warn';
  }

  return 'monitor-inspector__vital--poor';
}

export const VitalTile = ({ name, metric }: VitalTileProps) => {
  return (
    <li
      aria-label={`${VITAL_FULL_NAMES[name]}: ${metric ? formatVital(name, metric.value) : 'pending'}`}
      className={[
        'monitor-inspector__vital',
        metric ? ratingClass(metric.rating) : 'monitor-inspector__vital--pending',
      ].join(' ')}
      title={VITAL_FULL_NAMES[name]}
    >
      <Text as="span" className="monitor-inspector__vital-name" color="dim" variant="caption">
        {name}
      </Text>
      <Text
        as="span"
        className="monitor-inspector__vital-value monitor-inspector__value"
        variant="numeric"
      >
        {metric ? formatVital(name, metric.value) : '—'}
      </Text>
      {metric && (
        <Text as="span" className="monitor-inspector__vital-rating" variant="caption">
          {metric.rating === 'needs-improvement' ? 'meh' : metric.rating}
        </Text>
      )}
    </li>
  );
};
