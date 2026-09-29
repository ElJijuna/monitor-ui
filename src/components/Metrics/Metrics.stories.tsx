import { Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDemoMonitor } from '@/stories/demoMonitor';
import { MONITOR_METRIC_KINDS, MonitorMetric, type MonitorMetricProps } from './MonitorMetric';
import type { MetricSize } from './types';

const SIZES: Exclude<MetricSize, 'auto'>[] = ['pill', 'sm', 'md', 'lg'];

const SIZE_NOTES: Record<Exclude<MetricSize, 'auto'>, string> = {
  pill: '< 240px · value + micro spark',
  sm: '≥ 240px · card with trend',
  md: '≥ 380px · + stats and actions',
  lg: '≥ 600px · + drill-down panel',
};

/* Metrics that stay meaningful in Storybook (the React collector is disabled there). */
const LIVE_METRICS = MONITOR_METRIC_KINDS.filter((kind) => kind !== 'react');

const page: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  minHeight: '100vh',
  padding: 24,
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ alignItems: 'baseline', display: 'flex', gap: 10 }}>
      <Text variant="heading">{title}</Text>
      {note && (
        <Text color="dim" variant="caption">
          {note}
        </Text>
      )}
    </div>
    {children}
  </section>
);

type PlaygroundProps = Omit<MonitorMetricProps, 'monitor'>;

const PlaygroundStory = (props: PlaygroundProps) => {
  const monitor = useDemoMonitor();

  return <MonitorMetric {...props} monitor={monitor} />;
};

const meta = {
  title: 'Components/Metrics',
  component: PlaygroundStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Standalone metric widgets. Each one reads a single collector through monitor-api hooks, so they can be dropped anywhere. The layout is chosen by **container queries** from the width of the slot: pill → sm → md → lg. `size` pins a preset width instead.',
      },
    },
  },
  argTypes: {
    metric: { control: 'select', options: MONITOR_METRIC_KINDS },
    size: { control: 'inline-radio', options: ['auto', ...SIZES] },
    label: { control: 'text' },
    allowClear: { control: 'boolean' },
    allowFlush: { control: 'boolean', if: { arg: 'metric', eq: 'reporter' } },
  },
  args: {
    metric: 'fps',
    size: 'md',
    allowClear: true,
    allowFlush: true,
  },
  decorators: [
    (Story) => (
      <div style={page}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlaygroundStory>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Any metric at any size. Switch `size` to `auto` and resize the canvas to watch it adapt. */
export const Playground: Story = {};

/* ── Size matrix ────────────────────────────────────────── */

const SizeMatrixStory = ({ metric }: Pick<PlaygroundProps, 'metric'>) => {
  const monitor = useDemoMonitor();

  return (
    <>
      {SIZES.map((size) => (
        <Section key={size} note={SIZE_NOTES[size]} title={size.toUpperCase()}>
          <MonitorMetric allowClear allowFlush metric={metric} monitor={monitor} size={size} />
        </Section>
      ))}
    </>
  );
};

/** The same widget in its four presets, fed by one monitor. */
export const Sizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
    label: { table: { disable: true } },
    allowClear: { table: { disable: true } },
    allowFlush: { table: { disable: true } },
  },
  args: { metric: 'network' },
  render: ({ metric }) => <SizeMatrixStory metric={metric} />,
};

/* ── Resizable container ────────────────────────────────── */

function layoutFor(width: number): string {
  if (width >= 600) {
    return 'lg';
  }

  if (width >= 380) {
    return 'md';
  }

  return width >= 240 ? 'sm' : 'pill';
}

const ResizableStory = ({ metric }: Pick<PlaygroundProps, 'metric'>) => {
  const monitor = useDemoMonitor();
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const box = boxRef.current;

    if (!box) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(Math.round(entry.contentRect.width));
      }
    });

    observer.observe(box);

    return () => observer.disconnect();
  }, []);

  return (
    <Section
      note={`${width}px → ${layoutFor(width)} (drag the bottom-right corner)`}
      title="Container queries"
    >
      <div
        ref={boxRef}
        style={{
          border: '1px dashed var(--gnome-border-subtle, rgba(127, 127, 127, 0.4))',
          borderRadius: 16,
          maxWidth: '100%',
          minWidth: 160,
          overflow: 'hidden',
          padding: 8,
          resize: 'horizontal',
          width: 320,
        }}
      >
        <MonitorMetric allowClear metric={metric} monitor={monitor} />
      </div>
    </Section>
  );
};

/** One `size="auto"` widget in a resizable slot. The layout follows the slot, not the viewport. */
export const ResizableContainer: Story = {
  argTypes: {
    size: { table: { disable: true } },
    label: { table: { disable: true } },
    allowClear: { table: { disable: true } },
    allowFlush: { table: { disable: true } },
  },
  args: { metric: 'fps' },
  render: ({ metric }) => <ResizableStory metric={metric} />,
};

/* ── Compositions ───────────────────────────────────────── */

const StatusBarStory = () => {
  const monitor = useDemoMonitor();

  return (
    <Section note="size=pill · drop them in a toolbar or footer" title="Status bar">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {LIVE_METRICS.map((metric) => (
          <MonitorMetric key={metric} metric={metric} monitor={monitor} size="pill" />
        ))}
      </div>
    </Section>
  );
};

/** Every metric as a pill. */
export const StatusBar: Story = {
  argTypes: { metric: { table: { disable: true } }, size: { table: { disable: true } } },
  render: () => <StatusBarStory />,
};

const GalleryStory = () => {
  const monitor = useDemoMonitor();
  const grid = (min: number): CSSProperties => ({
    display: 'grid',
    gap: 12,
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
  });

  return (
    <>
      <Section note="size=auto in a 260px grid → sm" title="Compact grid">
        <div style={grid(260)}>
          {LIVE_METRICS.map((metric) => (
            <MonitorMetric key={metric} metric={metric} monitor={monitor} />
          ))}
        </div>
      </Section>
      <Section note="size=auto in a 400px grid → md" title="Detailed grid">
        <div style={grid(400)}>
          {LIVE_METRICS.map((metric) => (
            <MonitorMetric key={metric} allowClear allowFlush metric={metric} monitor={monitor} />
          ))}
        </div>
      </Section>
    </>
  );
};

/** The same components in auto grids — column width alone decides sm vs md. */
export const Gallery: Story = {
  argTypes: { metric: { table: { disable: true } }, size: { table: { disable: true } } },
  render: () => <GalleryStory />,
};

const CompositionStory = () => {
  const monitor = useDemoMonitor();

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        maxWidth: 1200,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, gridColumn: '1 / -1' }}>
        <MonitorMetric metric="fps" monitor={monitor} size="pill" />
        <MonitorMetric metric="memory" monitor={monitor} size="pill" />
        <MonitorMetric metric="errors" monitor={monitor} size="pill" />
      </div>
      <MonitorMetric allowClear metric="network" monitor={monitor} />
      <MonitorMetric allowClear metric="webVitals" monitor={monitor} />
      <MonitorMetric allowClear metric="errors" monitor={monitor} />
      <MonitorMetric allowFlush metric="reporter" monitor={monitor} />
      <MonitorMetric allowClear metric="events" monitor={monitor} />
      <MonitorMetric allowClear metric="fps" monitor={monitor} />
    </div>
  );
};

/** Mixed slots: pills in a header, lg widgets in the wide column, md/sm in the side column. */
export const Composition: Story = {
  argTypes: { metric: { table: { disable: true } }, size: { table: { disable: true } } },
  render: () => <CompositionStory />,
};
