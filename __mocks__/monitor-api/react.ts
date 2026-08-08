import type {
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

export const usePerformance = jest.fn(
  (_monitor: Monitor): PerformanceSnapshot => performanceSnapshot(),
);
export const useNetwork = jest.fn((_monitor: Monitor): NetworkSnapshot => networkSnapshot());
export const useEvents = jest.fn((_monitor: Monitor): EventSnapshot => eventSnapshot());
export const useReact = jest.fn((_monitor: Monitor): ReactSnapshot => reactSnapshot());
export const useWebVitals = jest.fn((_monitor: Monitor): WebVitalsSnapshot => webVitalsSnapshot());

export const useMonitor = jest.fn(
  (_monitor: Monitor): MonitorSnapshot => ({
    timestamp: 0,
    performance: performanceSnapshot(),
    network: networkSnapshot(),
    react: reactSnapshot(),
    events: eventSnapshot(),
    webVitals: webVitalsSnapshot(),
  }),
);
export const useSignal = jest.fn(<T>(signal: SSignal<T>): T => signal.value);
