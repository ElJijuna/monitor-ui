import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Monitor, MonitorError, MonitorEvent } from 'monitor-api';
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
import { WebVitalsMetric } from './WebVitalsMetric';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

beforeEach(() => {
  // Read signals as-is; the shared mock falls back to a reporter snapshot for null values.
  jest.mocked(hooks.useSignal).mockImplementation((signal) => signal.value);
});

const REPORTER_IDLE = {
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
}

function makeMonitor({ latestEvent = null, latestError = null }: FakeSignals = {}) {
  return {
    performance: { clearHistory: jest.fn() },
    network: { clearLog: jest.fn() },
    events: { clearLog: jest.fn(), onEvent: { value: latestEvent } },
    errors: { clearLog: jest.fn(), onError: { value: latestError } },
    webVitals: { clearLog: jest.fn() },
    react: { clearLog: jest.fn() },
    reporter: { snapshot: { value: REPORTER_IDLE }, flush: jest.fn(async () => true) },
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
  it('renders fps, history summary and CLS', () => {
    jest.mocked(hooks.usePerformance).mockReturnValue({
      fps: 58.4,
      fpsHistory: [50, 60, 55],
      memory: null,
      memoryHistory: [],
      longTasks: { count: 2, lastDuration: 81.6 },
      cls: 0.042,
    });
    render(<FpsMetric monitor={makeMonitor()} />);

    expect(screen.getByText('58')).toBeInTheDocument();
    expect(screen.getByText('smooth')).toBeInTheDocument();
    expect(screen.getByText('82ms')).toBeInTheDocument();
    expect(screen.getByText('0.042')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'good');
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
      cls: 0,
    });
    render(<MemoryMetric monitor={makeMonitor()} />);
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('+20.0%')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('data-tone', 'bad');
  });
});

describe('NetworkMetric', () => {
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
