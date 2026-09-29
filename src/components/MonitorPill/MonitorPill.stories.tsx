import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { MonitorPill, type MonitorPillProps, type MonitorPillScope } from './MonitorPill';

const SCOPES: MonitorPillScope[] = ['performance', 'network', 'events', 'errors'];

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
          'Clickable entry point (button) that opens the inspector. For read-only, resizable widgets see **Components/Metrics** with `size="pill"`.',
      },
    },
  },
  argTypes: {
    scope: { control: 'inline-radio', options: SCOPES },
    onClick: { action: 'clicked' },
  },
  args: { scope: 'performance', label: 'Open monitor' },
} satisfies Meta<typeof MonitorPillStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Performance: Story = {};

export const Network: Story = {
  args: { scope: 'network' },
};

export const Events: Story = {
  args: { scope: 'events' },
};

export const Errors: Story = {
  args: { scope: 'errors', label: 'Open error monitor' },
};

const AllScopesStory = () => {
  const monitor = useDemoMonitor();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {SCOPES.map((scope) => (
        <MonitorPill key={scope} monitor={monitor} scope={scope} />
      ))}
    </div>
  );
};

/** All scopes side by side, sharing one monitor. */
export const AllScopes: Story = {
  argTypes: { scope: { table: { disable: true } } },
  render: () => <AllScopesStory />,
};
