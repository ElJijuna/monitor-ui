import { Button } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Monitor } from 'monitor-api';
import { createMonitor, emitMonitorEvent } from 'monitor-api';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MonitorInspector } from '@/components/MonitorInspector';
import { Dashboard } from './Dashboard';

const MOCK_ENDPOINTS = [
  { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/users/1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/todos?_limit=10', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/comments?postId=1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/albums/1/photos', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/posts', method: 'POST' },
  { url: 'https://jsonplaceholder.typicode.com/posts/999', method: 'GET' }, // 404
];

function useMockRequests() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function fire() {
      const endpoint = MOCK_ENDPOINTS[Math.floor(Math.random() * MOCK_ENDPOINTS.length)];

      try {
        await fetch(endpoint.url, {
          signal: controller.signal,
          method: endpoint.method,
          ...(endpoint.method === 'POST' && {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'mock', body: 'test', userId: 1 }),
          }),
        });
      } catch {
        // network failures are also captured by monitor-api
      }

      if (!controller.signal.aborted) {
        timeoutId = setTimeout(fire, 600 + Math.random() * 1400);
      }
    }

    fire();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);
}

function useDemoMonitor() {
  const monitor = useMemo<Monitor>(
    () =>
      createMonitor({
        // Observing this dashboard's own React commits creates a render feedback loop.
        collectors: ['performance', 'network', 'events', 'webVitals', 'errors'],
        maxHistory: 120,
      }),
    [],
  );

  useEffect(() => {
    monitor.start();

    const events = window.setInterval(() => {
      const labels = ['user:login', 'route:change', 'cache:miss', 'error:caught', 'api:retry'];

      emitMonitorEvent(labels[Math.floor(Math.random() * labels.length)], { ts: Date.now() });
    }, 1400);

    return () => {
      window.clearInterval(events);
      monitor.stop();
    };
  }, [monitor]);

  return monitor;
}

const DashboardStory = (props: Omit<ComponentProps<typeof Dashboard>, 'monitor'>) => {
  const monitor = useDemoMonitor();

  useMockRequests();

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <Dashboard {...props} monitor={monitor} />
    </div>
  );
};

const meta = {
  title: 'Components/Dashboard',
  component: DashboardStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onBack: { table: { disable: true } },
  },
} satisfies Meta<typeof DashboardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Dashboard' },
  render: (args) => <DashboardStory {...args} />,
};

const DashboardWithBackStory = () => {
  const monitor = useDemoMonitor();

  useMockRequests();
  const [view, setView] = useState<'inspector' | 'dashboard'>('dashboard');

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {view === 'dashboard' ? (
        <Dashboard monitor={monitor} onBack={() => setView('inspector')} title="Dashboard" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <Button onClick={() => setView('dashboard')} size="sm" variant="flat">
            Dashboard
          </Button>
          <MonitorInspector monitor={monitor} />
        </div>
      )}
    </div>
  );
};

export const WithNavigation: Story = {
  args: { title: 'Dashboard' },
  render: () => <DashboardWithBackStory />,
};
