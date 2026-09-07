import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useErrors } from 'monitor-api/react';

interface PillErrorsViewProps {
  monitor: Monitor;
}

export const PillErrorsView = ({ monitor }: PillErrorsViewProps) => {
  const errors = useErrors(monitor);

  return (
    <div className="monitor-pill__segment">
      <Text color="dim" variant="caption">
        Errors
      </Text>
      <Text
        className="monitor-pill__value"
        color={errors.totalErrors > 0 ? 'error' : undefined}
        variant="numeric"
      >
        {errors.totalErrors}
      </Text>
    </div>
  );
};
