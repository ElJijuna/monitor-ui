import { Button, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { MonitorInspector } from '@/components/MonitorInspector';
import { MonitorPill } from '@/components/MonitorPill';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { ResizableFrame } from '@/stories/ResizableFrame';
import { Dashboard, type DashboardProps } from './Dashboard';

type DashboardStoryProps = Omit<DashboardProps, 'monitor'>;

/** Mirrors the container queries in Dashboard.css. */
function dashboardLayout(width: number): string {
  if (width <= 320) {
    return 'single column';
  }

  if (width <= 480) {
    return 'compact';
  }

  return width <= 720 ? 'medium' : 'wide';
}

const page: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  minHeight: '100vh',
  padding: 24,
};

const DashboardStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();

  return <Dashboard {...props} monitor={monitor} />;
};

const meta = {
  title: 'Components/Dashboard',
  component: DashboardStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The dashboard is an inline-size container: KPIs, charts and logs reflow from the width of the slot it is placed in (wide → medium ≤ 720px → compact ≤ 480px → single column ≤ 320px), so it works the same in a full page, a split view or a side panel.',
      },
    },
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
      <div style={page}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Fills the canvas. */
export const Default: Story = {};

/** Clear the error log and flush the (flaky, in-memory) production reporter on demand. */
export const WithActions: Story = {
  args: { allowClearErrors: true, allowFlushReport: true },
};

/** Diagnostics sections hidden. */
export const MetricsOnly: Story = {
  args: { showErrors: false, showReporter: false },
};

/* ── Container queries ──────────────────────────────────── */

const ResizableStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();

  return (
    <ResizableFrame
      describe={dashboardLayout}
      initialWidth={640}
      minWidth={260}
      title="Resizable slot"
    >
      <Dashboard {...props} monitor={monitor} />
    </ResizableFrame>
  );
};

/** Drag the slot: the layout follows the slot width while the viewport stays the same. */
export const ResizableContainer: Story = {
  render: (args) => <ResizableStory {...args} />,
};

const SLOT_WIDTHS = [1080, 640, 400, 300] as const;

const WidthsStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();

  return (
    <>
      {SLOT_WIDTHS.map((width) => (
        <section key={width} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ alignItems: 'baseline', display: 'flex', gap: 10 }}>
            <Text variant="heading">{dashboardLayout(width)}</Text>
            <Text color="dim" variant="caption">
              {width}px slot
            </Text>
          </div>
          <div style={{ maxWidth: '100%', width }}>
            <Dashboard {...props} monitor={monitor} title={`${width}px`} />
          </div>
        </section>
      ))}
    </>
  );
};

/** Every layout at once, fed by one monitor — impossible to show with viewport media queries. */
export const Widths: Story = {
  args: { showErrors: false, showReporter: false },
  render: (args) => <WidthsStory {...args} />,
};

/* ── In an application shell ────────────────────────────── */

const AppShellStory = (props: DashboardStoryProps) => {
  const monitor = useDemoMonitor();
  const [panel, setPanel] = useState<'closed' | 'inspector' | 'dashboard'>('dashboard');
  const panelWidth = panel === 'dashboard' ? 'minmax(0, 1fr)' : '380px';

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateAreas: "'toolbar toolbar' 'main panel'",
        gridTemplateColumns:
          panel === 'closed' ? 'minmax(0, 1fr) 0' : `minmax(0, 1fr) ${panelWidth}`,
        gridTemplateRows: 'auto 1fr',
        minHeight: 'calc(100vh - 48px)',
      }}
    >
      <header
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: 8,
          gridArea: 'toolbar',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="title-4">My application</Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <MonitorPill
            monitor={monitor}
            onClick={() => setPanel((current) => (current === 'closed' ? 'inspector' : 'closed'))}
          />
          <MonitorPill monitor={monitor} onClick={() => setPanel('inspector')} scope="errors" />
        </div>
      </header>

      <main
        style={{
          border: '1px dashed var(--gnome-border-subtle, rgba(127, 127, 127, 0.4))',
          borderRadius: 16,
          gridArea: 'main',
          padding: 24,
        }}
      >
        <Text color="dim">
          Application content. Open the monitor from the pills; the dashboard adapts to the panel
          width, not to the window.
        </Text>
      </main>

      {panel !== 'closed' && (
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            gridArea: 'panel',
            minWidth: 0,
          }}
        >
          {panel === 'inspector' ? (
            <>
              <Button onClick={() => setPanel('dashboard')} size="sm" variant="suggested">
                Open dashboard
              </Button>
              <MonitorInspector monitor={monitor} />
            </>
          ) : (
            <Dashboard {...props} monitor={monitor} onBack={() => setPanel('inspector')} />
          )}
        </aside>
      )}
    </div>
  );
};

/**
 * Pill → Inspector → Dashboard inside a split view sharing one monitor. The panel is
 * 380px for the inspector and half the window for the dashboard.
 */
export const InAppShell: Story = {
  render: (args) => <AppShellStory {...args} />,
};
