import { useEffect, useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonitor, emitMonitorEvent } from 'monitor-api'
import type { Monitor } from 'monitor-api'
import { Dashboard } from './Dashboard'
import { MonitorInspector } from '../MonitorInspector'

const meta = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    monitor: { table: { disable: true } },
    onBack: { table: { disable: true } },
  },
} satisfies Meta<typeof Dashboard>

export default meta

type Story = StoryObj<typeof meta>

function useDemoMonitor() {
  const monitor = useMemo<Monitor>(() => createMonitor({ maxHistory: 120 }), [])

  useEffect(() => {
    monitor.start()

    const events = window.setInterval(() => {
      const labels = ['user:login', 'route:change', 'cache:miss', 'error:caught', 'api:retry']
      emitMonitorEvent(labels[Math.floor(Math.random() * labels.length)], { ts: Date.now() })
    }, 1400)

    return () => {
      window.clearInterval(events)
      monitor.destroy()
    }
  }, [monitor])

  return monitor
}

function DashboardStory(props: Omit<React.ComponentProps<typeof Dashboard>, 'monitor'>) {
  const monitor = useDemoMonitor()
  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <Dashboard {...props} monitor={monitor} />
    </div>
  )
}

export const Default: Story = {
  args: { title: 'Dashboard' },
  render: (args) => <DashboardStory {...args} />,
}

function DashboardWithBackStory() {
  const monitor = useDemoMonitor()
  const [view, setView] = useState<'inspector' | 'dashboard'>('dashboard')

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {view === 'dashboard' ? (
        <Dashboard monitor={monitor} onBack={() => setView('inspector')} title="Dashboard" />
      ) : (
        <div style={{ maxWidth: 420 }}>
          <MonitorInspector
            monitor={monitor}
            onOpenDashboard={() => setView('dashboard')}
            open
            title="Monitor"
          />
        </div>
      )}
    </div>
  )
}

export const WithNavigation: Story = {
  args: { title: 'Dashboard' },
  render: () => <DashboardWithBackStory />,
}
