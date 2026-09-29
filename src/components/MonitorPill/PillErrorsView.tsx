import { Text } from '@gnome-ui/react';
import type { Monitor } from 'monitor-api';
import { useErrors } from 'monitor-api/react';
import { selectTotalErrors } from '@/utils/selectors';

interface PillErrorsViewProps {
  monitor: Monitor;
}

export const PillErrorsView = ({ monitor }: PillErrorsViewProps) => {
  const totalErrors = useErrors(monitor, selectTotalErrors);

  return (
    <div className="monitor-pill__segment">
      <Text color="dim" variant="caption">
        Errors
      </Text>
      <Text
        className="monitor-pill__value"
        color={totalErrors > 0 ? 'error' : undefined}
        variant="numeric"
      >
        {totalErrors}
      </Text>
    </div>
  );
};
