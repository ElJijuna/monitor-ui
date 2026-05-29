import { useEffect, useMemo, useState } from 'react'
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
    monitor: { table: { disable: true } },
    onOpenDashboard: { table: { disable: true } },
    onClose: { table: { disable: true } },
  },
} satisfies Meta<typeof MonitorInspector>

export default meta

type Story = StoryObj<typeof meta>

function useDemoMonitor() {
  const monitor = useMemo<Monitor>(() => createMonitor({
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

  return monitor
}

function MonitorInspectorStory(props: Omit<React.ComponentProps<typeof MonitorInspector>, 'monitor'>) {
  const monitor = useDemoMonitor()
  return <MonitorInspector {...props} monitor={monitor} />
}

export const Open: Story = {
  args: {
    open: true,
    title: 'Monitor',
  },
  render: (args) => <MonitorInspectorStory {...args} />,
}

function WithDashboardStory() {
  const monitor = useDemoMonitor()
  const [dashboardOpen, setDashboardOpen] = useState(false)

  if (dashboardOpen) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setDashboardOpen(false)} style={{ marginBottom: 16 }}>
          ← Back to Inspector
        </button>
        <div>Dashboard would render here</div>
      </div>
    )
  }

  return (
    <MonitorInspector
      monitor={monitor}
      onOpenDashboard={() => setDashboardOpen(true)}
      open
      title="Monitor"
    />
  )
}

export const WithDashboardButton: Story = {
  args: { open: true },
  render: () => <WithDashboardStory />,
}
