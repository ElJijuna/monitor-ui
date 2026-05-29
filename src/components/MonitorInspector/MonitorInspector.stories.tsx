import { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMonitor, emitMonitorEvent } from 'monitor-api'
import type { Monitor } from 'monitor-api'
import { MonitorInspector, type MonitorInspectorProps } from './MonitorInspector'

function useDemoMonitor() {
  const monitor = useMemo<Monitor>(() => createMonitor({
    collectors: { react: false },
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

function MonitorInspectorStory(props: Omit<MonitorInspectorProps, 'monitor'>) {
  const monitor = useDemoMonitor()
  return (
    <div style={{ width: 360, height: '80vh', overflow: 'auto', border: '1px solid var(--gnome-border-subtle)' }}>
      <MonitorInspector {...props} monitor={monitor} />
    </div>
  )
}

const meta = {
  title: 'Components/MonitorInspector',
  component: MonitorInspectorStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MonitorInspectorStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'Monitor' },
}

