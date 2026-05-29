export const usePerformance = jest.fn(() => ({
  fps: 60,
  fpsHistory: [60],
  memory: { used: 42, total: 128, percent: 32.8 },
  memoryHistory: [32],
  longTasks: { count: 0, lastDuration: null },
  cls: 0,
}))

export const useNetwork = jest.fn(() => ({
  entries: [],
  window5s: { count: 0, avgLatency: 0, totalPayload: 0 },
}))

export const useEvents = jest.fn(() => ({
  entries: [],
  labelStats: new Map(),
}))

export const useReact = jest.fn(() => ({
  totalCommits: 0,
  slowComponents: [],
  renderStats: new Map(),
}))

export const useWebVitals = jest.fn(() => ({
  cls: null,
  fcp: null,
  inp: null,
  lcp: null,
  ttfb: null,
  entries: [],
}))

export const useMonitor = jest.fn(() => ({}))
export const useSignal = jest.fn((signal: unknown) => signal)
