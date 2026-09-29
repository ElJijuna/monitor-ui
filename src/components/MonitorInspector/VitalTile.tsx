import { Text } from '@gnome-ui/react';
import type { WebVitalMetric, WebVitalName } from 'monitor-api';
import { describeAttribution, formatVital, VITAL_FULL_NAMES } from './formatters';

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
  const attribution = metric ? describeAttribution(metric) : null;
  const phases = attribution?.phases.filter((phase) => phase.value > 0) ?? [];
  const phaseTotal = phases.reduce((sum, phase) => sum + phase.value, 0);
  // Attribution details, for the tooltip and the accessible name.
  const details = [
    attribution?.target,
    ...phases.map((phase) => `${phase.label} ${formatVital(name, phase.value)}`),
  ].filter(Boolean);
  const summary = `${VITAL_FULL_NAMES[name]}: ${metric ? formatVital(name, metric.value) : 'pending'}`;

  return (
    <li
      aria-label={[summary, ...details].join('. ')}
      className={[
        'monitor-inspector__vital',
        metric ? ratingClass(metric.rating) : 'monitor-inspector__vital--pending',
      ].join(' ')}
      title={[VITAL_FULL_NAMES[name], ...details].join('\n')}
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
      {phaseTotal > 0 && (
        <span aria-hidden="true" className="monitor-inspector__vital-phases">
          {phases.map((phase) => (
            <span
              key={phase.label}
              className="monitor-inspector__vital-phase"
              style={{ flexGrow: phase.value / phaseTotal }}
            />
          ))}
        </span>
      )}
    </li>
  );
};
