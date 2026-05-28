import { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonitor, emitMonitorEvent } from 'monitor-api'
import type { Monitor } from 'monitor-api'
import { MonitorInspector } from './MonitorInspector'

const meta = {
  title: 'Components/MonitorInspector',
  component: MonitorInspector,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    monitor: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof MonitorInspector>

export default meta

type Story = StoryObj<typeof meta>

function MonitorInspectorStory(props: Omit<React.ComponentProps<typeof MonitorInspector>, 'monitor'>) {
  const monitor = useMemo<Monitor>(() => createMonitor({
    collectors: {
      performance: true,
      events: true,
      network: false,
      react: false,
    },
    maxHistory: 60,
  }), [])

  useEffect(() => {
    monitor.start()

    const timer = window.setInterval(() => {
      emitMonitorEvent('storybook:tick', { at: Date.now() })
    }, 1400)

    return () => {
      window.clearInterval(timer)
      monitor.destroy()
    }
  }, [monitor])

  return <MonitorInspector {...props} monitor={monitor} />
}

export const Open: Story = {
  args: {
    open: true,
    title: 'Monitor',
  },
  render: (args) => <MonitorInspectorStory {...args} />,
}
