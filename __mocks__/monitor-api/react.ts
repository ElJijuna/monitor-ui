import type {
  ErrorSnapshot,
  EventSnapshot,
  Monitor,
  MonitorSnapshot,
  NetworkSnapshot,
  PerformanceSnapshot,
  ReactSnapshot,
  WebVitalsSnapshot,
} from 'monitor-api';
import type SSignal from 'ssignal';

const performanceSnapshot = (): PerformanceSnapshot => ({
  fps: 60,
  fpsHistory: [60],
  memory: { used: 42, total: 128, percent: 32.8 },
  memoryHistory: [32],
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

const networkSnapshot = (): NetworkSnapshot => ({
  entries: [],
  window5s: { count: 0, avgLatency: 0, totalPayload: 0, errorRate: 0 },
});

const eventSnapshot = (): EventSnapshot => ({
  entries: [],
  byLabel: {},
});

const reactSnapshot = (): ReactSnapshot => ({
  totalCommits: 0,
  truncatedCommits: 0,
  entries: [],
  byComponent: {},
  slowComponents: [],
});

const webVitalsSnapshot = (): WebVitalsSnapshot => ({
  cls: null,
  fcp: null,
  inp: null,
  lcp: null,
  ttfb: null,
  entries: [],
});

const errorSnapshot = (): ErrorSnapshot => ({ entries: [], totalErrors: 0, droppedErrors: 0 });

type Selector<T> = (snapshot: T) => unknown;
type SnapshotImpl<T> = (monitor: Monitor) => T;

/**
 * Mocks a `SnapshotHook`: implementations (including `mockReturnValue*`, which jest routes
 * through `mockImplementation*`) supply the full snapshot, and the hook applies the optional
 * selector like the real one, so tests keep stubbing whole snapshots.
 */
function snapshotHook<T>(initial: () => T) {
  const select =
    (impl: SnapshotImpl<T>) =>
    (monitor: Monitor, selector?: Selector<T>): unknown => {
      const snapshot = impl(monitor);

      return selector ? selector(snapshot) : snapshot;
    };
  const hook = jest.fn(select(() => initial()));
  const { mockImplementation, mockImplementationOnce } = hook;

  hook.mockImplementation = (impl) => mockImplementation(select(impl as SnapshotImpl<T>));
  hook.mockImplementationOnce = (impl) => mockImplementationOnce(select(impl as SnapshotImpl<T>));

  // Typed as a plain snapshot mock so tests can pass whole snapshots to `mockReturnValue`.
  return hook as unknown as jest.Mock<T, [Monitor, Selector<T>?, unknown?]>;
}

export const usePerformance = snapshotHook(performanceSnapshot);
export const useNetwork = snapshotHook(networkSnapshot);
export const useEvents = snapshotHook(eventSnapshot);
export const useReact = snapshotHook(reactSnapshot);
export const useWebVitals = snapshotHook(webVitalsSnapshot);
export const useErrors = snapshotHook(errorSnapshot);

export const shallowEqual = jest.fn((previous: unknown, next: unknown) =>
  Object.is(previous, next),
);

export const useMonitor = jest.fn(
  (_monitor: Monitor): MonitorSnapshot => ({
    timestamp: 0,
    performance: performanceSnapshot(),
    network: networkSnapshot(),
    react: reactSnapshot(),
    events: eventSnapshot(),
    errors: errorSnapshot(),
    webVitals: webVitalsSnapshot(),
  }),
);
export const useSignal = jest.fn(
  <T>(signal: SSignal<T>): T =>
    signal?.value ??
    ({
      status: 'disabled',
      attempts: 0,
      sent: 0,
      failed: 0,
      dropped: 0,
      retries: 0,
      cancelled: 0,
      skipped: 0,
      lastSuccessAt: null,
      lastFailure: null,
    } as T),
);
