import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { MonitorInspector, type MonitorInspectorProps } from './MonitorInspector';

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
  args: {
    showErrors: true,
    showReporter: true,
    allowClearErrors: false,
    allowFlushReport: false,
  },
} satisfies Meta<typeof MonitorInspectorStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: { allowClearErrors: true, allowFlushReport: true },
};

export const Minimal: Story = {
  args: { showErrors: false, showReporter: false },
};
