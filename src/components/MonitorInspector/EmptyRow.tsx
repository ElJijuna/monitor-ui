import { Text } from '@gnome-ui/react';
import type { ReactNode } from 'react';

export const EmptyRow = ({ children }: { children: ReactNode }) => {
  return (
    <Text className="monitor-inspector__empty" color="dim" variant="caption">
      {children}
    </Text>
  );
};
