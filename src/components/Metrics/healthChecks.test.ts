import type { ReporterSnapshot, WebVitalMetric } from 'monitor-api';
import { evaluateHealth, type HealthInput } from './healthChecks';

const REPORTER_DISABLED: ReporterSnapshot = {
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
};

/** A monitor that has not reported anything yet. */
function input(overrides: Partial<HealthInput> = {}): HealthInput {
  return {
    online: null,
    totalErrors: 0,
    vitals: [],
    fps: 0,
    fpsSamples: 0,
    memoryPercent: null,
    longFrames: { count: 0, maxBlockingDuration: null },
    window5s: { count: 0, avgLatency: 0, totalPayload: 0, errorRate: 0 },
    assets: { count: 0, failed: 0 },
    reporter: REPORTER_DISABLED,
    ...overrides,
  };
}

function vital(overrides: Partial<WebVitalMetric>): WebVitalMetric {
  return {
    name: 'LCP',
    value: 1200,
    delta: 0,
    rating: 'good',
    id: 'v',
    navigationType: 'navigate',
    navigationId: 1,
    navigationURL: null,
    timestamp: 0,
    ...overrides,
  };
}

const byId = (checks: ReturnType<typeof evaluateHealth>, id: string) =>
  checks.find((check) => check.id === id);

describe('evaluateHealth', () => {
  it('has only errors and long frames to judge before anything is reported', () => {
    const checks = evaluateHealth(input());

    expect(checks.filter((check) => check.tone !== 'neutral').map((check) => check.id)).toEqual([
      'errors',
      'long-frames',
    ]);
    expect(checks.every((check) => check.tone === 'good' || check.tone === 'neutral')).toBe(true);
  });

  it('puts the most serious check first, keeping priority order within a severity', () => {
    const checks = evaluateHealth(
      input({
        online: false,
        totalErrors: 3,
        fps: 40,
        fpsSamples: 10,
        assets: { count: 10, failed: 2 },
      }),
    );

    expect(checks.slice(0, 4).map((check) => [check.id, check.tone, check.summary])).toEqual([
      ['connection', 'bad', 'Offline'],
      ['errors', 'bad', '3 errors'],
      ['fps', 'warn', '40 fps'],
      ['assets', 'warn', '2 assets failed'],
    ]);
  });

  it('summarizes Web Vitals by the worst rating', () => {
    const poor = evaluateHealth(
      input({
        vitals: [vital({}), vital({ name: 'INP', value: 520, rating: 'poor' })],
      }),
    );
    const good = evaluateHealth(
      input({ vitals: [vital({}), vital({ name: 'CLS', value: 0.01 })] }),
    );

    expect(byId(poor, 'vitals')).toMatchObject({ tone: 'bad', summary: 'INP 520ms' });
    expect(byId(good, 'vitals')).toMatchObject({ tone: 'good', summary: '2/2 good' });
  });

  it('flags failing and slow traffic', () => {
    const failing = evaluateHealth(
      input({ window5s: { count: 4, avgLatency: 100, totalPayload: 0, errorRate: 0.25 } }),
    );
    const slow = evaluateHealth(
      input({ window5s: { count: 2, avgLatency: 820, totalPayload: 0, errorRate: 0 } }),
    );

    expect(byId(failing, 'network')).toMatchObject({ tone: 'warn', summary: '25% failed' });
    expect(byId(slow, 'network')).toMatchObject({ tone: 'bad', summary: '820ms' });
  });

  it('treats low heap usage as passing and high as critical', () => {
    expect(byId(evaluateHealth(input({ memoryPercent: 30 })), 'memory')?.tone).toBe('good');
    expect(byId(evaluateHealth(input({ memoryPercent: 91 })), 'memory')).toMatchObject({
      tone: 'bad',
      summary: '91% heap',
    });
  });

  it('rates long frames by the worst blocking time', () => {
    const checks = evaluateHealth(input({ longFrames: { count: 2, maxBlockingDuration: 240 } }));

    expect(byId(checks, 'long-frames')).toMatchObject({ tone: 'bad', summary: '240ms blocked' });
  });

  it('reports reporter retries and failures', () => {
    const retrying = evaluateHealth(
      input({ reporter: { ...REPORTER_DISABLED, status: 'retrying' } }),
    );
    const failing = evaluateHealth(
      input({
        reporter: {
          ...REPORTER_DISABLED,
          status: 'idle',
          sent: 1,
          failed: 3,
          lastFailure: 'transport',
        },
      }),
    );

    expect(byId(retrying, 'reporter')).toMatchObject({
      tone: 'warn',
      summary: 'Reporter retrying',
    });
    expect(byId(failing, 'reporter')).toMatchObject({ tone: 'bad', summary: 'Reporter failing' });
  });
});
