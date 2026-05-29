import type { ReactNode } from 'react'
import { Text } from '@gnome-ui/react'

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <Text className="monitor-inspector__empty" color="dim" variant="caption">
      {children}
    </Text>
  )
}
