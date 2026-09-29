import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  LongAnimationFrameEntry,
  Monitor,
  MonitorError,
  MonitorEvent,
  NetworkEntry,
  PerformanceSnapshot,
  ReactSnapshot,
  ReporterSnapshot,
  ResourceEntry,
  ResourceSnapshot,
  WebVitalMetric,
} from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { ErrorsMetric } from './ErrorsMetric';
import { EventsMetric } from './EventsMetric';
import { FpsMetric } from './FpsMetric';
import { MemoryMetric } from './MemoryMetric';
import { MetricCard } from './MetricCard';
import { MonitorMetric } from './MonitorMetric';
import { NetworkMetric } from './NetworkMetric';
import { ReactMetric } from './ReactMetric';
import { ReporterMetric } from './ReporterMetric';
import { ResourcesMetric } from './ResourcesMetric';
import { WebVitalsMetric } from './WebVitalsMetric';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

beforeEach(() => {
  // Read signals as-is; the shared mock falls back to a reporter snapshot for null values.
  jest.mocked(hooks.useSignal).mockImplementation((signal) => signal.value);
});

const REPORTER_IDLE: ReporterSnapshot = {
  status: 'idle' as const,
  attempts: 4,
  sent: 3,
  failed: 1,
  dropped: 0,
  retries: 1,
  cancelled: 0,
  skipped: 0,
  lastSuccessAt: null,
  lastFailure: 'timeout' as const,
};

interface FakeSignals {
  latestEvent?: MonitorEvent | null;
  latestError?: MonitorError | null;
  reporter?: ReporterSnapshot;
}

function makeMonitor({
  latestEvent = null,
  latestError = null,
  reporter = REPORTER_IDLE,
}: FakeSignals = {}) {
  return {
    performance: { clearHistory: jest.fn() },
    network: { clearLog: jest.fn() },
    events: { clearLog: jest.fn(), onEvent: { value: latestEvent } },
    errors: { clearLog: jest.fn(), onError: { value: latestError } },
    webVitals: { clearLog: jest.fn() },
    resources: { clearLog: jest.fn() },
    react: { clearLog: jest.fn() },
    reporter: { snapshot: { value: reporter }, flush: jest.fn(async () => true) },
  } as unknown as Monitor;
}

describe('MetricCard', () => {
  it('exposes size and tone as data attributes for the container-query styles', () => {
    render(<MetricCard label="FPS" size="pill" tone="good" value={60} />);
    const group = screen.getByRole('group', { name: 'FPS' });

    expect(group).toHaveAttribute('data-size', 'pill');
    expect(group).toHaveAttribute('data-tone', 'good');
  });

  it('defaults to the auto size and neutral tone', () => {
    render(<MetricCard label="X" value={1} />);
    const group = screen.getByRole('group', { name: 'X' });

    expect(group).toHaveAttribute('data-size', 'auto');
    expect(group).toHaveAttribute('data-tone', 'neutral');
  });

  it('sets the accent custom property', () => {
    render(<MetricCard accent="red" label="X" value={1} />);
    expect(screen.getByRole('group').style.getPropertyValue('--monitor-metric-accent')).toBe('red');
  });

  it('flags the surface when drill-down details are present', () => {
    const { container } = render(<MetricCard details={<span>more</span>} label="X" value={1} />);

    expect(container.querySelector('.monitor-metric__surface')).toHaveAttribute('data-details');
  });

  it('renders stats inside a description list', () => {
    render(<MetricCard label="X" stats={[{ label: 'Min', value: 12 }]} value={1} />);
    expect(screen.getByText('Min').closest('dl')).toHaveClass('monitor-metric__stats');
    expect(screen.getByText('12').closest('dl')).toHaveClass('monitor-metric__stats');
  });
});

describe('FpsMetric', () => {
  it('renders fps, history summary, CLS and the scripts behind long frames', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce({
      fps: 58.4,
      fpsHistory: [50, 60, 55],
      memory: null,
      memoryHistory: [],
      longTasks: { count: 2, lastDuration: 81.6 },
      longAnimationFrames: {
        count: 2,
        totalBlockingDuration: 300.4,
        maxBlockingDuration: 240,
        entries: [
          { ...frame(), startTime: 1, blockingDuration: 60.2, scripts: [] },
          {
            ...frame(),
            startTime: 2,
            blockingDuration: 240,
            scripts: [
              {
                invokerType: 'event-listener',
                invoker: 'BUTTON#save.onclick',
                sourceURL: 'https://app.test/assets/app.js?v=1',
                sourceFunctionName: 'save',
                duration: 180.4,
                forcedStyleAndLayoutDuration: 0,
                pauseDuration: 0,
              },
            ],
          },
        ],
      },
      memoryMeasurement: null,
      cls: 0.042,
    });
    const { container } = render(<FpsMetric monitor={makeMonitor()} />);

    expect(screen.getByText('58')).toBeInTheDocument();
    expect(screen.getByText('smooth')).toBeInTheDocument();
    expect(screen.getByText('0.042')).toBeInTheDocument();
    expect(screen.getByText('Long frames · 300ms blocked')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'good');

    // Newest frame first, named after its longest script.
    const rows = screen.getAllByRole('listitem');

    expect(rows[0]).toHaveTextContent('BUTTON#save.onclick');
    expect(rows[0]).toHaveTextContent('event-listener · 180ms · /assets/app.js?v=1');
    expect(rows[0]).toHaveTextContent('240ms');
    expect(rows[0]).toHaveAttribute('data-tone', 'bad');
    expect(rows[1]).toHaveTextContent('Unattributed frame');
    expect(rows[1]).toHaveAttribute('data-tone', 'warn');
    expect(container.querySelector('.monitor-metric__stat[data-tone="bad"]')).toHaveTextContent(
      'Long frames2',
    );
  });

  it('says when the browser has no Long Animation Frames support', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf());
    render(<FpsMetric monitor={makeMonitor()} />);

    expect(
      screen.getByText('Long Animation Frames are not supported in this browser'),
    ).toBeInTheDocument();
  });

  it('clears the performance history', async () => {
    const monitor = makeMonitor();

    render(<FpsMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.performance.clearHistory).toHaveBeenCalledTimes(1);
  });
});

describe('MemoryMetric', () => {
  it('shows unsupported when the browser exposes no heap info', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce({
      fps: 60,
      fpsHistory: [],
      memory: null,
      memoryHistory: [],
      longTasks: { count: 0, lastDuration: null },
      longAnimationFrames: {
        count: 0,
        totalBlockingDuration: 0,
        maxBlockingDuration: null,
        entries: [],
      },
      memoryMeasurement: null,
      cls: 0,
    });
    render(<MemoryMetric monitor={makeMonitor()} />);
    expect(screen.getByText('unsupported')).toBeInTheDocument();
  });

  it('flags high heap usage', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce({
      fps: 60,
      fpsHistory: [],
      memory: { used: 900, total: 1000, percent: 90 },
      memoryHistory: [70, 90],
      longTasks: { count: 0, lastDuration: null },
      longAnimationFrames: {
        count: 0,
        totalBlockingDuration: 0,
        maxBlockingDuration: null,
        entries: [],
      },
      memoryMeasurement: null,
      cls: 0,
    });
    render(<MemoryMetric monitor={makeMonitor()} />);
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('+20.0%')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'bad');
  });
});

describe('NetworkMetric', () => {
  it('is bad and says so while the device is offline', () => {
    jest.mocked(hooks.useDevice).mockReturnValueOnce({
      hardwareConcurrency: 4,
      online: false,
      offlineCount: 1,
    });
    render(<NetworkMetric monitor={makeMonitor()} />);

    expect(screen.getByText('offline')).toBeInTheDocument();
    expect(tone()).toBe('bad');
  });

  const entry = {
    id: 'a',
    url: 'https://api.example.com/users?page=2',
    method: 'GET',
    status: 503,
    latency: 120,
    payloadSize: 2048,
    requestSize: 0,
    initiator: 'fetch' as const,
    timestamp: 0,
    error: null,
  };

  it('is idle without traffic', () => {
    render(<NetworkMetric monitor={makeMonitor()} />);
    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(screen.getByText('No requests captured yet')).toBeInTheDocument();
  });

  it('shows rolling latency, error rate and recent requests', () => {
    jest.mocked(hooks.useNetwork).mockReturnValueOnce({
      entries: [entry],
      window5s: { count: 4, avgLatency: 140.6, totalPayload: 4096, errorRate: 0.25 },
    });
    render(<NetworkMetric monitor={makeMonitor()} />);

    expect(screen.getByText('141')).toBeInTheDocument();
    expect(screen.getByText('4 req / 5s')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('/users?page=2')).toBeInTheDocument();
    expect(screen.getByText('GET · fetch · 2 KB')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'warn');
  });
});

describe('EventsMetric', () => {
  it('ranks labels and shows the latest event from onEvent', () => {
    const latest: MonitorEvent = { id: '3', label: 'cart:add', data: { sku: 1 }, timestamp: 0 };

    jest.mocked(hooks.useEvents).mockReturnValueOnce({
      entries: [latest, { ...latest, id: '2' }, { ...latest, id: '1', label: 'route:change' }],
      byLabel: { 'route:change': 1, 'cart:add': 2 },
    });
    render(<EventsMetric monitor={makeMonitor({ latestEvent: latest })} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('cart:add')).toHaveLength(3); // caption, top stat, ranked row
    expect(screen.getByText('1 keys')).toBeInTheDocument();
  });

  it('clears the event log', async () => {
    const monitor = makeMonitor();

    jest.mocked(hooks.useEvents).mockReturnValueOnce({
      entries: [{ id: '1', label: 'a', data: null, timestamp: 0 }],
      byLabel: { a: 1 },
    });
    render(<EventsMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.events.clearLog).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorsMetric', () => {
  it('summarizes deduplicated errors', () => {
    const error = {
      id: 'e1',
      source: 'unhandledrejection' as const,
      details: { name: 'TypeError', message: 'boom', stack: null },
      timestamp: 0,
      lastSeenAt: 0,
      occurrences: 3,
    };

    jest.mocked(hooks.useErrors).mockReturnValueOnce({
      entries: [error],
      totalErrors: 5,
      droppedErrors: 1,
    });
    render(<ErrorsMetric monitor={makeMonitor({ latestError: error })} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('TypeError')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByText('×3')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'bad');
  });

  it('is clean without errors', () => {
    render(<ErrorsMetric monitor={makeMonitor()} />);
    expect(screen.getByText('clean')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'good');
  });
});

describe('WebVitalsMetric', () => {
  it('scores reported vitals', () => {
    const lcp = {
      name: 'LCP' as const,
      value: 1800,
      delta: 0,
      rating: 'good' as const,
      id: 'l',
      navigationType: 'navigate',
      navigationId: 1,
      navigationURL: null,
      timestamp: 0,
    };
    const inp = {
      ...lcp,
      name: 'INP' as const,
      value: 320,
      rating: 'needs-improvement' as const,
      id: 'i',
    };

    jest.mocked(hooks.useWebVitals).mockReturnValueOnce({
      lcp,
      inp,
      cls: null,
      fcp: null,
      ttfb: null,
      entries: [lcp, inp],
    });
    render(<WebVitalsMetric monitor={makeMonitor()} />);

    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('2/5 reported')).toBeInTheDocument();
    expect(screen.getByText('Interaction to Next Paint')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'warn');
  });

  it('is pending before any report', () => {
    render(<WebVitalsMetric monitor={makeMonitor()} />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});

describe('ReactMetric', () => {
  it('ranks components by total render time', () => {
    jest.mocked(hooks.useReact).mockReturnValueOnce({
      totalCommits: 7,
      truncatedCommits: 0,
      entries: [],
      byComponent: {
        List: { renders: 2, totalDuration: 12, avgDuration: 6, lastRender: 0 },
        Row: { renders: 10, totalDuration: 4, avgDuration: 0.4, lastRender: 0 },
      },
      slowComponents: [],
    });
    render(<ReactMetric monitor={makeMonitor()} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('1.3ms')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('List');
  });
});

describe('ReporterMetric', () => {
  it('shows delivery counters and flushes on demand', async () => {
    const monitor = makeMonitor();

    render(<ReporterMetric allowFlush monitor={monitor} />);

    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(screen.getAllByText('timeout')).not.toHaveLength(0);
    await userEvent.click(screen.getByText('Send now'));
    expect(monitor.reporter.flush).toHaveBeenCalledTimes(1);
  });
});

describe('MonitorMetric', () => {
  it('renders the requested metric', () => {
    render(<MonitorMetric metric="network" monitor={makeMonitor()} size="lg" />);
    const group = screen.getByRole('group', { name: 'Network' });

    expect(group).toHaveAttribute('data-size', 'lg');
  });

  it('forwards allowFlush to the reporter metric only', () => {
    render(<MonitorMetric allowFlush metric="reporter" monitor={makeMonitor()} />);
    expect(screen.getByText('Send now')).toBeInTheDocument();
  });
});

/* ── Edge cases and tone branches ───────────────────────── */

function perf(overrides: Partial<PerformanceSnapshot> = {}): PerformanceSnapshot {
  return {
    fps: 60,
    fpsHistory: [60, 60],
    memory: { used: 40, total: 100, percent: 40 },
    memoryHistory: [40],
    longTasks: { count: 0, lastDuration: null },
    longAnimationFrames: {
      count: 0,
      totalBlockingDuration: 0,
      maxBlockingDuration: null,
      entries: [],
    },
    memoryMeasurement: null,
    cls: 0,
    ...overrides,
  };
}

function frame(overrides: Partial<LongAnimationFrameEntry> = {}): LongAnimationFrameEntry {
  return {
    startTime: 0,
    duration: 120,
    blockingDuration: 70,
    renderStart: 0,
    styleAndLayoutStart: 0,
    firstUIEventTimestamp: 0,
    scripts: [],
    timestamp: 0,
    ...overrides,
  };
}

function request(overrides: Partial<NetworkEntry> = {}): NetworkEntry {
  return {
    id: String(Math.random()),
    url: '/api/ok',
    method: 'GET',
    status: 200,
    latency: 80,
    payloadSize: 0,
    requestSize: 0,
    initiator: 'fetch',
    timestamp: 0,
    error: null,
    ...overrides,
  };
}

function vital(overrides: Partial<WebVitalMetric> = {}): WebVitalMetric {
  return {
    name: 'LCP',
    value: 1200,
    delta: 0,
    rating: 'good',
    id: String(Math.random()),
    navigationType: 'navigate',
    navigationId: 1,
    navigationURL: null,
    timestamp: 0,
    ...overrides,
  };
}

function reactSnapshot(overrides: Partial<ReactSnapshot> = {}): ReactSnapshot {
  return {
    totalCommits: 0,
    truncatedCommits: 0,
    entries: [],
    byComponent: {},
    slowComponents: [],
    ...overrides,
  };
}

const tone = () => screen.getAllByRole('group')[0]?.getAttribute('data-tone');

describe('FpsMetric branches', () => {
  it('waits for samples before judging the frame rate', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ fps: 0, fpsHistory: [] }));
    render(<FpsMetric monitor={makeMonitor()} />);

    expect(screen.getByText('waiting')).toBeInTheDocument();
    expect(tone()).toBe('neutral');
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3); // min/avg + long frames
  });

  it.each([
    [40, 'janky', 'warn'],
    [12, 'slow', 'bad'],
  ])('labels %p fps as %p', (fps, caption, expected) => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ fps, fpsHistory: [fps, fps] }));
    render(<FpsMetric monitor={makeMonitor()} />);

    expect(screen.getByText(caption)).toBeInTheDocument();
    expect(tone()).toBe(expected);
  });

  it('uses a custom label', () => {
    render(<FpsMetric label="Frame rate" monitor={makeMonitor()} />);
    expect(screen.getByRole('group', { name: 'Frame rate' })).toBeInTheDocument();
  });

  it('disables Clear without history', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ fpsHistory: [] }));
    render(<FpsMetric allowClear monitor={makeMonitor()} />);
    expect(screen.getByText('Clear')).toBeDisabled();
  });

  it('hides Clear unless allowed', () => {
    render(<FpsMetric monitor={makeMonitor()} />);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });
});

describe('MemoryMetric branches', () => {
  it.each([
    [40, 'neutral'],
    [70, 'warn'],
    [95, 'bad'],
  ])('maps %p%% heap usage to %p', (percent, expected) => {
    jest
      .mocked(hooks.usePerformance)
      .mockReturnValueOnce(
        perf({ memory: { used: percent, total: 100, percent }, memoryHistory: [percent] }),
      );
    render(<MemoryMetric monitor={makeMonitor()} />);

    expect(screen.getByText(`${percent}% used`)).toBeInTheDocument();
    expect(tone()).toBe(expected);
  });

  it('shows no trend with a single sample', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ memoryHistory: [40] }));
    render(<MemoryMetric monitor={makeMonitor()} />);
    expect(screen.getByText('Trend').nextSibling).toHaveTextContent('—');
  });

  it('shows a negative trend without a sign prefix', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ memoryHistory: [50, 40] }));
    render(<MemoryMetric monitor={makeMonitor()} />);
    expect(screen.getByText('-10.0%')).toBeInTheDocument();
  });

  it('shows placeholders without retained history', () => {
    jest.mocked(hooks.usePerformance).mockReturnValueOnce(perf({ memoryHistory: [] }));
    render(<MemoryMetric allowClear monitor={makeMonitor()} />);

    expect(screen.getByText('Peak').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('Clear')).toBeDisabled();
  });

  it('clears the history even when heap info is unavailable', async () => {
    const monitor = makeMonitor();

    jest.mocked(hooks.usePerformance).mockReturnValue(perf({ memory: null, memoryHistory: [1] }));
    render(<MemoryMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.performance.clearHistory).toHaveBeenCalledTimes(1);
    jest.mocked(hooks.usePerformance).mockImplementation(() => perf());
  });
});

describe('NetworkMetric branches', () => {
  it.each([
    [{ count: 2, avgLatency: 900, totalPayload: 0, errorRate: 0 }, 'bad'],
    [{ count: 2, avgLatency: 100, totalPayload: 0, errorRate: 0.5 }, 'bad'],
    [{ count: 2, avgLatency: 100, totalPayload: 0, errorRate: 0 }, 'good'],
  ])('derives the tone from the 5s window %#', (window5s, expected) => {
    jest.mocked(hooks.useNetwork).mockReturnValueOnce({ entries: [], window5s });
    render(<NetworkMetric monitor={makeMonitor()} />);
    expect(tone()).toBe(expected);
  });

  it('rates each recent request', () => {
    jest.mocked(hooks.useNetwork).mockReturnValueOnce({
      entries: [
        request({ id: 'ok', url: '/ok' }),
        request({ id: 'slow', url: '/slow', latency: 900 }),
        request({ id: 'fail', url: '/fail', status: 0, error: 'Failed to fetch' }),
      ],
      window5s: { count: 3, avgLatency: 300, totalPayload: 0, errorRate: 1 / 3 },
    });
    render(<NetworkMetric monitor={makeMonitor()} />);
    const [fail, slow, ok] = screen.getAllByRole('listitem');

    expect(fail).toHaveTextContent('ERR');
    expect(fail).toHaveAttribute('data-tone', 'bad');
    expect(slow).toHaveAttribute('data-tone', 'warn');
    expect(ok).toHaveAttribute('data-tone', 'good');
  });

  it('clears the request log', async () => {
    const monitor = makeMonitor();

    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [request()],
      window5s: { count: 0, avgLatency: 0, totalPayload: 0, errorRate: 0 },
    });
    render(<NetworkMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.network.clearLog).toHaveBeenCalledTimes(1);
    jest.mocked(hooks.useNetwork).mockImplementation(() => ({
      entries: [],
      window5s: { count: 0, avgLatency: 0, totalPayload: 0, errorRate: 0 },
    }));
  });

  it('disables Clear with an empty log', () => {
    render(<NetworkMetric allowClear monitor={makeMonitor()} />);
    expect(screen.getByText('Clear')).toBeDisabled();
  });
});

describe('EventsMetric branches', () => {
  it('shows placeholders before any event', () => {
    render(<EventsMetric monitor={makeMonitor()} />);

    expect(screen.getByText('no events')).toBeInTheDocument();
    expect(screen.getByText('No events recorded yet')).toBeInTheDocument();
    expect(screen.getByText('Top').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('Last').nextSibling).toHaveTextContent('—');
  });

  it('shows no payload keys for events without data', () => {
    const latest: MonitorEvent = { id: '1', label: 'ping', data: null, timestamp: 0 };

    jest.mocked(hooks.useEvents).mockReturnValueOnce({ entries: [latest], byLabel: { ping: 1 } });
    render(<EventsMetric monitor={makeMonitor({ latestEvent: latest })} />);
    expect(screen.getByText('Payload').nextSibling).toHaveTextContent('—');
  });

  it('disables Clear with an empty log', () => {
    render(<EventsMetric allowClear monitor={makeMonitor()} />);
    expect(screen.getByText('Clear')).toBeDisabled();
  });
});

describe('ErrorsMetric branches', () => {
  const error: MonitorError = {
    id: 'e',
    source: 'manual',
    details: { name: 'RangeError', message: '', stack: null },
    timestamp: 0,
    lastSeenAt: 0,
    occurrences: 1,
  };

  it('falls back to the error name when the message is empty', () => {
    jest.mocked(hooks.useErrors).mockReturnValueOnce({
      entries: [error],
      totalErrors: 1,
      droppedErrors: 0,
    });
    render(<ErrorsMetric monitor={makeMonitor({ latestError: error })} />);

    expect(screen.getAllByText('RangeError')).toHaveLength(2); // caption + list row
    expect(screen.getByText('Unhandled').nextSibling).toHaveTextContent('0');
  });

  it('clears the error log', async () => {
    const monitor = makeMonitor();

    jest
      .mocked(hooks.useErrors)
      .mockReturnValue({ entries: [error], totalErrors: 1, droppedErrors: 0 });
    render(<ErrorsMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.errors.clearLog).toHaveBeenCalledTimes(1);
    jest.mocked(hooks.useErrors).mockImplementation(() => ({
      entries: [],
      totalErrors: 0,
      droppedErrors: 0,
    }));
  });
});

describe('WebVitalsMetric branches', () => {
  it('explains attributed reports with their target and slowest phase', () => {
    const inp = vital({
      name: 'INP',
      value: 320,
      rating: 'needs-improvement',
      attribution: {
        interactionTarget: 'button#save',
        interactionType: 'pointer',
        interactionTime: 100,
        inputDelay: 20,
        processingDuration: 240,
        presentationDelay: 60,
        loadState: 'complete',
        longestScript: {
          url: null,
          invoker: 'BUTTON#save.onclick',
          invokerType: 'event-listener',
          subpart: 'processing-duration',
          intersectingDuration: 200,
        },
        totalScriptDuration: null,
        totalStyleAndLayoutDuration: null,
        totalPaintDuration: null,
        totalUnattributedDuration: null,
      },
    });

    jest.mocked(hooks.useWebVitals).mockReturnValueOnce({
      lcp: null,
      inp,
      cls: null,
      fcp: null,
      ttfb: null,
      entries: [inp, vital({ name: 'TTFB', value: 90 })],
    });
    render(<WebVitalsMetric monitor={makeMonitor()} />);

    // Newest report first.
    const [plain, attributed] = screen.getAllByRole('listitem');

    expect(attributed).toHaveTextContent('button#save → BUTTON#save.onclick · Processing 240ms');
    // Without attribution the row keeps the navigation type and time.
    expect(plain).toHaveTextContent('navigate ·');
  });

  it('is bad when any vital is poor', () => {
    const poor = vital({ name: 'CLS', value: 0.4, rating: 'poor' });

    jest.mocked(hooks.useWebVitals).mockReturnValueOnce({
      lcp: vital(),
      inp: null,
      cls: poor,
      fcp: null,
      ttfb: null,
      entries: [poor],
    });
    render(<WebVitalsMetric monitor={makeMonitor()} />);

    expect(tone()).toBe('bad');
    const clsStat = screen
      .getAllByText('CLS')
      .find((element) => element.classList.contains('monitor-metric__stat-label'));

    expect(clsStat?.nextSibling).toHaveTextContent('0.400');
  });

  it('is good when every reported vital is good', () => {
    jest.mocked(hooks.useWebVitals).mockReturnValueOnce({
      lcp: vital(),
      inp: null,
      cls: null,
      fcp: vital({ name: 'FCP', value: 800 }),
      ttfb: null,
      entries: [],
    });
    render(<WebVitalsMetric monitor={makeMonitor()} />);

    expect(tone()).toBe('good');
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('clears the vitals log', async () => {
    const monitor = makeMonitor();
    const lcp = vital();

    jest.mocked(hooks.useWebVitals).mockReturnValue({
      lcp,
      inp: null,
      cls: null,
      fcp: null,
      ttfb: null,
      entries: [lcp],
    });
    render(<WebVitalsMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.webVitals.clearLog).toHaveBeenCalledTimes(1);
    jest.mocked(hooks.useWebVitals).mockImplementation(() => ({
      lcp: null,
      inp: null,
      cls: null,
      fcp: null,
      ttfb: null,
      entries: [],
    }));
  });
});

describe('ReactMetric branches', () => {
  const slowRender = {
    component: 'Grid',
    duration: 40,
    timestamp: 0,
    type: 'update' as const,
    commitId: 1,
  };

  it('is idle before any commit', () => {
    render(<ReactMetric allowClear monitor={makeMonitor()} />);

    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(tone()).toBe('neutral');
    expect(screen.getByText('Avg render').nextSibling).toHaveTextContent('—');
    expect(screen.getByText('Clear')).toBeDisabled();
  });

  it('warns about slow renders', () => {
    jest
      .mocked(hooks.useReact)
      .mockReturnValueOnce(
        reactSnapshot({ totalCommits: 3, slowComponents: [slowRender], entries: [slowRender] }),
      );
    render(<ReactMetric monitor={makeMonitor()} />);

    expect(screen.getByText('1 slow')).toBeInTheDocument();
    expect(tone()).toBe('warn');
  });

  it('flags truncated commits', () => {
    jest
      .mocked(hooks.useReact)
      .mockReturnValueOnce(
        reactSnapshot({ totalCommits: 3, truncatedCommits: 1, slowComponents: [slowRender] }),
      );
    render(<ReactMetric monitor={makeMonitor()} />);
    expect(tone()).toBe('bad');
  });

  it('is fast when commits have no slow renders', () => {
    jest.mocked(hooks.useReact).mockReturnValueOnce(reactSnapshot({ totalCommits: 2 }));
    render(<ReactMetric monitor={makeMonitor()} />);

    expect(screen.getByText('fast')).toBeInTheDocument();
    expect(tone()).toBe('good');
  });

  it('clears the render log', async () => {
    const monitor = makeMonitor();

    jest.mocked(hooks.useReact).mockReturnValue(reactSnapshot({ totalCommits: 2 }));
    render(<ReactMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.react.clearLog).toHaveBeenCalledTimes(1);
    jest.mocked(hooks.useReact).mockImplementation(() => reactSnapshot());
  });
});

describe('ReporterMetric branches', () => {
  it.each<[Partial<ReporterSnapshot>, string]>([
    [{ status: 'retrying' }, 'warn'],
    [{ status: 'sending', failed: 0, lastFailure: null }, 'good'],
    [{ status: 'idle', sent: 1, failed: 4, lastFailure: 'transport' }, 'bad'],
    [{ status: 'disabled' }, 'neutral'],
    [{ status: 'stopped' }, 'neutral'],
  ])('maps %p to %p', (overrides, expected) => {
    render(
      <ReporterMetric monitor={makeMonitor({ reporter: { ...REPORTER_IDLE, ...overrides } })} />,
    );
    expect(tone()).toBe(expected);
  });

  it('shows the last successful delivery', () => {
    const lastSuccessAt = new Date('2026-01-01T10:20:30').getTime();

    render(
      <ReporterMetric
        monitor={makeMonitor({ reporter: { ...REPORTER_IDLE, lastSuccessAt, lastFailure: null } })}
      />,
    );
    expect(screen.getByText('Last sent').nextSibling).toHaveTextContent(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('disables Send now while the reporter is not idle', () => {
    render(
      <ReporterMetric
        allowFlush
        monitor={makeMonitor({ reporter: { ...REPORTER_IDLE, status: 'sending' } })}
      />,
    );
    expect(screen.getByText('Send now')).toBeDisabled();
  });

  it('shows progress while flushing and recovers after a failed flush', async () => {
    const monitor = makeMonitor();

    let rejectFlush: (reason: Error) => void = () => undefined;

    jest.mocked(monitor.reporter.flush).mockImplementationOnce(
      () =>
        new Promise<boolean>((_, reject) => {
          rejectFlush = reject;
        }),
    );
    render(<ReporterMetric allowFlush monitor={monitor} />);
    await userEvent.click(screen.getByText('Send now'));

    expect(screen.getByText('Sending…')).toBeDisabled();

    await act(async () => rejectFlush(new Error('boom')));
    expect(screen.getByText('Send now')).toBeEnabled();
  });

  it('hides Send now unless allowed', () => {
    render(<ReporterMetric monitor={makeMonitor()} />);
    expect(screen.queryByText('Send now')).not.toBeInTheDocument();
  });
});

describe('MonitorMetric kinds', () => {
  it.each([
    ['fps', 'FPS'],
    ['memory', 'JS Heap'],
    ['network', 'Network'],
    ['events', 'Events'],
    ['errors', 'Errors'],
    ['resources', 'Resources'],
    ['webVitals', 'Web Vitals'],
    ['react', 'React'],
    ['reporter', 'Reporter'],
  ] as const)('renders %p as %p', (metric, name) => {
    render(<MonitorMetric metric={metric} monitor={makeMonitor()} size="sm" />);
    expect(screen.getByRole('group', { name })).toHaveAttribute('data-size', 'sm');
  });

  it('forwards allowClear to clearable metrics', () => {
    render(<MonitorMetric allowClear metric="events" monitor={makeMonitor()} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('ignores allowClear for the reporter', () => {
    render(<MonitorMetric allowClear metric="reporter" monitor={makeMonitor()} />);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });
});

/* ── Resources ──────────────────────────────────────────── */

function asset(overrides: Partial<ResourceEntry> = {}): ResourceEntry {
  return {
    url: 'https://app.test/assets/app.js',
    type: 'script',
    initiatorType: 'script',
    duration: 200,
    transferSize: 20_480,
    encodedBodySize: 20_000,
    decodedBodySize: 60_000,
    cache: 'miss',
    renderBlocking: false,
    status: 200,
    thirdParty: false,
    timestamp: 0,
    ...overrides,
  };
}

function resources(
  overrides: Partial<ResourceSnapshot['totals']> = {},
  slowest: ResourceEntry[] = [],
) {
  const stats = {
    count: 0,
    transferSize: 0,
    decodedBodySize: 0,
    cacheHits: 0,
    totalDuration: 0,
    maxDuration: 0,
  };

  return {
    entries: slowest,
    totals: {
      ...stats,
      thirdPartyCount: 0,
      thirdPartyTransferSize: 0,
      renderBlockingCount: 0,
      failedCount: 0,
      ...overrides,
    },
    byType: {
      script: stats,
      stylesheet: stats,
      image: stats,
      font: stats,
      media: stats,
      iframe: stats,
      other: stats,
    },
    slowest,
  } satisfies ResourceSnapshot;
}

describe('ResourcesMetric', () => {
  it('waits for the first asset', () => {
    render(<ResourcesMetric allowClear monitor={makeMonitor()} />);

    expect(screen.getByText('waiting')).toBeInTheDocument();
    expect(screen.getByText('No assets recorded yet')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeDisabled();
    expect(tone()).toBe('neutral');
  });

  it('summarizes page weight and lists the slowest assets', () => {
    jest.mocked(hooks.useResources).mockReturnValueOnce(
      resources(
        {
          count: 4,
          transferSize: 512_000,
          cacheHits: 1,
          maxDuration: 1_400,
          thirdPartyCount: 2,
          renderBlockingCount: 1,
        },
        [
          asset({
            url: 'https://cdn.test/hero.webp',
            type: 'image',
            duration: 1_400,
            thirdParty: true,
          }),
          asset({
            type: 'stylesheet',
            url: '/main.css',
            duration: 700,
            cache: 'hit',
            renderBlocking: true,
          }),
          asset({
            type: 'font',
            url: 'https://fonts.test/a.woff2',
            cache: 'unknown',
            duration: 350,
          }),
        ],
      ),
    );
    const { container } = render(<ResourcesMetric monitor={makeMonitor()} />);

    expect(screen.getByText('500 KB')).toBeInTheDocument();
    expect(screen.getByText('4 assets')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument(); // cache hits
    expect(tone()).toBe('warn');

    const rows = screen.getAllByRole('listitem');

    expect(rows[0]).toHaveTextContent('IMG/hero.webp20 KB · third-party1400ms');
    expect(rows[0]).toHaveAttribute('data-tone', 'warn');
    expect(rows[1]).toHaveTextContent('cached · render-blocking');
    expect(rows[2]).toHaveTextContent('size hidden');

    const bars = container.querySelectorAll<HTMLElement>('.monitor-metric__list-bar');

    expect(bars[1]?.style.inlineSize).toBe('50%');
  });

  it('is bad when an asset failed', () => {
    jest
      .mocked(hooks.useResources)
      .mockReturnValueOnce(resources({ count: 1, failedCount: 1 }, [asset({ status: 404 })]));
    render(<ResourcesMetric monitor={makeMonitor()} />);

    expect(tone()).toBe('bad');
    expect(screen.getByRole('listitem')).toHaveAttribute('data-tone', 'bad');
  });

  it('clears the resource log', async () => {
    const monitor = makeMonitor();

    jest.mocked(hooks.useResources).mockReturnValueOnce(resources({ count: 1 }, [asset()]));
    render(<ResourcesMetric allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(monitor.resources.clearLog).toHaveBeenCalledTimes(1);
  });
});
