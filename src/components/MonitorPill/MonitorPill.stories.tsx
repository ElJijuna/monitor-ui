import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Monitor } from 'monitor-api';
import { createMonitor, emitMonitorEvent } from 'monitor-api';
import { useEffect, useMemo } from 'react';
import { MonitorPill, type MonitorPillProps } from './MonitorPill';

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

    const labels = ['user:login', 'route:change', 'cache:miss', 'error:caught'];
    const timer = window.setInterval(() => {
      emitMonitorEvent(labels[Math.floor(Math.random() * labels.length)], { ts: Date.now() });
    }, 1400);

    return () => {
      window.clearInterval(timer);
      monitor.destroy();
    };
  }, [monitor]);

  return monitor;
}

const MonitorPillStory = (props: Omit<MonitorPillProps, 'monitor'>) => {
  const monitor = useDemoMonitor();

  return <MonitorPill {...props} monitor={monitor} />;
};

const meta = {
  title: 'Components/MonitorPill',
  component: MonitorPillStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MonitorPillStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Performance: Story = {
  args: { scope: 'performance', label: 'Open monitor' },
};

export const Network: Story = {
  args: { scope: 'network', label: 'Open monitor' },
};

export const Events: Story = {
  args: { scope: 'events', label: 'Open monitor' },
};
