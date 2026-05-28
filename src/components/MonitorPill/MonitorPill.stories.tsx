import { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonitor } from 'monitor-api'
import type { Monitor } from 'monitor-api'
import { MonitorPill } from './MonitorPill'

const meta = {
  title: 'Components/MonitorPill',
  component: MonitorPill,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    monitor: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof MonitorPill>

export default meta

type Story = StoryObj<typeof meta>

function MonitorPillStory(props: Omit<React.ComponentProps<typeof MonitorPill>, 'monitor'>) {
  const monitor = useMemo<Monitor>(() => createMonitor({ maxHistory: 60 }), [])

  useEffect(() => {
    monitor.start()
    return () => monitor.destroy()
  }, [monitor])

  return <MonitorPill {...props} monitor={monitor} />
}

export const Default: Story = {
  args: {
    label: 'Open monitor',
  },
  render: (args) => <MonitorPillStory {...args} />,
}
