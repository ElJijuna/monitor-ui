import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Monitor } from 'monitor-api';
import { createMonitor, emitMonitorEvent } from 'monitor-api';
import { useEffect, useMemo } from 'react';
import { MonitorInspector, type MonitorInspectorProps } from './MonitorInspector';

function useDemoMonitor() {
  const monitor = useMemo<Monitor>(
    () =>
      createMonitor({
        collectors: { react: false },
        maxHistory: 60,
      }),
    [],
  );

  useEffect(() => {
    monitor.start();

    const timer = window.setInterval(() => {
      emitMonitorEvent('storybook:tick', { at: Date.now() });
    }, 1400);

    return () => {
      window.clearInterval(timer);
      monitor.destroy();
    };
  }, [monitor]);

  return monitor;
}

const MonitorInspectorStory = (props: Omit<MonitorInspectorProps, 'monitor'>) => {
  const monitor = useDemoMonitor();

  return (
    <div
      style={{
        width: 360,
        height: '80vh',
        overflow: 'auto',
        border: '1px solid var(--gnome-border-subtle)',
      }}
    >
      <MonitorInspector {...props} monitor={monitor} />
    </div>
  );
};

const meta = {
  title: 'Components/MonitorInspector',
  component: MonitorInspectorStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MonitorInspectorStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
