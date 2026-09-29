import type { Meta, StoryObj } from '@storybook/react-vite';
import { MONITOR_METRIC_KINDS } from '@/components/Metrics';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { MonitorPill, type MonitorPillProps } from './MonitorPill';

/* The React collector is disabled in Storybook, so its pill would stay at zero. */
const SCOPES = MONITOR_METRIC_KINDS.filter((kind) => kind !== 'react');

const MonitorPillStory = (props: Omit<MonitorPillProps, 'monitor'>) => {
  const monitor = useDemoMonitor();

  return <MonitorPill {...props} monitor={monitor} />;
};

const meta = {
  title: 'Components/MonitorPill',
  component: MonitorPillStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Clickable entry point that opens the inspector. It is the `size="pill"` metric widget for `scope`, activated as a button, so every metric widget can be a scope (`performance` is kept as an alias of `fps`). An offline chip appears next to it while the device collector reports no network. The same widgets in sm, md and lg live in **Components/Metrics**.',
      },
    },
  },
  argTypes: {
    scope: { control: 'select', options: ['performance', ...MONITOR_METRIC_KINDS] },
    onClick: { action: 'clicked' },
  },
  args: { scope: 'performance', label: 'Open monitor' },
} satisfies Meta<typeof MonitorPillStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Performance: Story = {};

/** The most serious current problem across every collector — one pill for the whole app. */
export const Health: Story = {
  args: { scope: 'health' },
};

export const Network: Story = {
  args: { scope: 'network' },
};

export const Events: Story = {
  args: { scope: 'events' },
};

export const WebVitals: Story = {
  args: { scope: 'webVitals' },
};

export const Resources: Story = {
  args: { scope: 'resources' },
};

export const Reporter: Story = {
  args: { scope: 'reporter', label: 'Open reporter status' },
};

export const Errors: Story = {
  args: { scope: 'errors', label: 'Open error monitor' },
};

const AllScopesStory = ({ onClick }: Pick<MonitorPillProps, 'onClick'>) => {
  const monitor = useDemoMonitor();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {SCOPES.map((scope) => (
        <MonitorPill key={scope} monitor={monitor} onClick={onClick} scope={scope} />
      ))}
    </div>
  );
};

/** Every scope side by side, sharing one monitor. Click one to log the action. */
export const AllScopes: Story = {
  argTypes: { scope: { table: { disable: true } } },
  render: ({ onClick }) => <AllScopesStory onClick={onClick} />,
};
