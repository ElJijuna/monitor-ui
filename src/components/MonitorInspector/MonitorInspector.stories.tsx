import type { Meta, StoryObj } from '@storybook/react-vite';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { ResizableFrame } from '@/stories/ResizableFrame';
import { MonitorInspector, type MonitorInspectorProps } from './MonitorInspector';

type InspectorStoryProps = Omit<MonitorInspectorProps, 'monitor'>;

/** Mirrors the widget layouts: `expanded` stacks below 600px, lg from 600px. */
function inspectorLayout(width: number): string {
  // The inspector content has 18px of padding on each side (12px at 360px or less).
  const widget = width - (width <= 360 ? 24 : 36);

  return widget >= 600 ? 'lg · list beside the card' : 'expanded · list under the card';
}

const panel = (width: number) => ({
  border: '1px solid var(--gnome-border-subtle)',
  height: '80vh',
  overflow: 'auto',
  width,
});

const InspectorStory = ({ width = 380, ...props }: InspectorStoryProps & { width?: number }) => {
  const monitor = useDemoMonitor();

  return (
    <div style={panel(width)}>
      <MonitorInspector {...props} monitor={monitor} />
    </div>
  );
};

const meta = {
  title: 'Components/MonitorInspector',
  component: InspectorStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Every metric widget in a scrolling panel, `expanded` so each shows its stats and drill-down list even when narrow. Widen the panel past ~640px and the widgets switch to their lg layout on their own (container queries).',
      },
    },
  },
  argTypes: {
    width: { control: { type: 'range', min: 280, max: 900, step: 20 } },
  },
  args: {
    width: 380,
    showErrors: true,
    showReporter: true,
    allowClearErrors: false,
    allowFlushReport: false,
  },
} satisfies Meta<typeof InspectorStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A typical side panel: widgets stacked, list under each card. */
export const Default: Story = {};

export const WithActions: Story = {
  args: { allowClearErrors: true, allowFlushReport: true },
};

export const Minimal: Story = {
  args: { showErrors: false, showReporter: false },
};

/** A wide panel: the same widgets in their lg layout, list beside the card. */
export const Wide: Story = {
  args: { width: 720 },
};

const ResizableStory = (props: InspectorStoryProps) => {
  const monitor = useDemoMonitor();

  return (
    <ResizableFrame
      describe={inspectorLayout}
      initialWidth={380}
      minWidth={280}
      title="Resizable panel"
    >
      <div style={{ height: '75vh', overflow: 'auto' }}>
        <MonitorInspector {...props} monitor={monitor} />
      </div>
    </ResizableFrame>
  );
};

/** Drag the panel wider to watch the widgets switch from expanded to lg. */
export const ResizablePanel: Story = {
  argTypes: { width: { table: { disable: true } } },
  parameters: { layout: 'padded' },
  render: (args) => <ResizableStory {...args} />,
};
