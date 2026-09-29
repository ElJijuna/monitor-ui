import { Button } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MonitorMetric } from '@/components/Metrics';
import { MonitorInspector } from '@/components/MonitorInspector';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { Dashboard, type DashboardProps } from './Dashboard';

type DashboardStoryProps = Omit<DashboardProps, 'monitor'>;

const DashboardStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();

  return <Dashboard {...props} monitor={monitor} />;
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
  args: {
    title: 'Dashboard',
    showErrors: true,
    showReporter: true,
    allowClearErrors: false,
    allowFlushReport: false,
  },
  decorators: [
    (Story) => (
      <div style={{ boxSizing: 'border-box', minHeight: '100vh', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Clear the error log and flush the (flaky, in-memory) production reporter on demand. */
export const WithActions: Story = {
  args: { allowClearErrors: true, allowFlushReport: true },
};

/** Minimal dashboard: diagnostics sections hidden. */
export const MetricsOnly: Story = {
  args: { showErrors: false, showReporter: false },
};

const NavigationStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();
  const [view, setView] = useState<'inspector' | 'dashboard'>('inspector');

  if (view === 'dashboard') {
    return <Dashboard {...props} monitor={monitor} onBack={() => setView('inspector')} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <MonitorMetric metric="fps" monitor={monitor} size="pill" />
        <MonitorMetric metric="errors" monitor={monitor} size="pill" />
      </div>
      <Button onClick={() => setView('dashboard')} size="sm" variant="suggested">
        Open dashboard
      </Button>
      <MonitorInspector monitor={monitor} />
    </div>
  );
};

/** Pill → Inspector → Dashboard, sharing a single monitor instance. */
export const WithNavigation: Story = {
  render: (args) => <NavigationStory {...args} />,
};
