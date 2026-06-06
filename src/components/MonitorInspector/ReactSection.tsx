import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useReact } from 'monitor-api/react';
import { INSPECTOR_MAX_SLOW_COMPONENTS } from '@/utils/constants';
import { EmptyRow } from './EmptyRow';

interface ReactSectionProps {
  monitor: Monitor;
}

export const ReactSection = ({ monitor }: ReactSectionProps) => {
  const react = useReact(monitor);
  const slowComponents = react.slowComponents.slice(0, INSPECTOR_MAX_SLOW_COMPONENTS);

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        React
      </Text>
      <BoxedList>
        <ActionRow
          title="Commits"
          trailing={
            <Text className="monitor-inspector__value" variant="numeric">
              {react.totalCommits}
            </Text>
          }
          variant="property"
        />
        {slowComponents.length > 0 ? (
          slowComponents.map((entry) => (
            <ActionRow
              key={`${entry.commitId}-${entry.component}-${entry.timestamp}`}
              subtitle={`${entry.type} - ${entry.duration.toFixed(1)}ms`}
              title={entry.component}
            />
          ))
        ) : (
          <EmptyRow>No slow components</EmptyRow>
        )}
      </BoxedList>
    </section>
  );
};
