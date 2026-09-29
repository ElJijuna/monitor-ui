import { Button, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { MonitorInspector } from '@/components/MonitorInspector';
import { MonitorPill } from '@/components/MonitorPill';
import { type DemoMonitorOptions, useDemoMonitor } from '@/stories/demoMonitor';
import { ResizableFrame } from '@/stories/ResizableFrame';
import { Dashboard, type DashboardProps } from './Dashboard';

type DashboardStoryProps = Omit<DashboardProps, 'monitor'> & DemoMonitorOptions;

/** Min column width, grid gap and content padding from Dashboard.css. */
const COLUMN_MIN = 300;
const GAP = 12;

/** Mirrors the widget grid in Dashboard.css: auto-fill columns, featured 2 × 2 from 640px. */
function dashboardLayout(width: number): string {
  const padding = width <= 480 ? 24 : 36;
  const columns = Math.max(1, Math.floor((width - 2 - padding + GAP) / (COLUMN_MIN + GAP)));
  const featured = width >= 640 ? ' · featured widgets in lg' : '';

  return `${columns} column${columns === 1 ? '' : 's'}${featured}`;
}

/** Splits the story args into the demo monitor options and the dashboard props. */
function useStoryMonitor({
  requests,
  events,
  errors,
  reporter,
  jank,
  ...props
}: DashboardStoryProps) {
  const monitor = useDemoMonitor({ requests, events, errors, reporter, jank });

  return { monitor, props };
}

const page: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  minHeight: '100vh',
  padding: 24,
};

const DashboardStory = (args: DashboardStoryProps) => {
  const { monitor, props } = useStoryMonitor(args);

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
          'The dashboard is built from the metric widgets in a bento grid: auto-fill columns of at least 300px and rows of a fixed minimum height, so widgets in a row share one height that does not jump as data arrives. From 640px the featured widgets — FPS, Network, Web Vitals and Errors — take 2 × 2 cells, which switches them to their lg layout with the drill-down panel: long frames and their scripts, recent requests, Web Vitals attribution, captured errors. The header shows connectivity and CPU chips from the device collector (toggle offline in DevTools → Network to see it change). Everything follows the width of the slot, not the viewport.',
      },
    },
  },
  argTypes: {
    onBack: { table: { disable: true } },
    requests: { table: { category: 'Demo data' } },
    events: { table: { category: 'Demo data' } },
    errors: { table: { category: 'Demo data' } },
    reporter: { table: { category: 'Demo data' } },
    jank: { table: { category: 'Demo data' } },
  },
  args: {
    title: 'Dashboard',
    showErrors: true,
    showReporter: true,
    allowClearErrors: false,
    allowFlushReport: false,
    requests: true,
    events: true,
    errors: true,
    reporter: true,
    jank: true,
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

/** Errors and reporter widgets hidden. */
export const MetricsOnly: Story = {
  args: { showErrors: false, showReporter: false },
};

/** No synthetic main-thread blocking: steady FPS and no long frames. */
export const Calm: Story = {
  args: { jank: false, errors: false },
};

/* ── Container queries ──────────────────────────────────── */

const ResizableStory = (args: DashboardStoryProps) => {
  const { monitor, props } = useStoryMonitor(args);

  return (
    <ResizableFrame
      describe={dashboardLayout}
      initialWidth={720}
      minWidth={280}
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

const SLOT_WIDTHS = [1280, 720, 400] as const;

const WidthsStory = (args: DashboardStoryProps) => {
  const { monitor, props } = useStoryMonitor(args);

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

const AppShellStory = (args: DashboardStoryProps) => {
  const { monitor, props } = useStoryMonitor(args);
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
