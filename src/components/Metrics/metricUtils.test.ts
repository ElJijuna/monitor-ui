import type { LongAnimationFrameEntry, LongAnimationFrameScript } from 'monitor-api';
import {
  blockingTone,
  clsTone,
  describeFrame,
  formatPercent,
  fpsTone,
  ratingTone,
  shortUrl,
  summarize,
  supportsLongAnimationFrames,
} from './metricUtils';

describe('fpsTone', () => {
  it('is neutral before any sample', () => {
    expect(fpsTone(60, false)).toBe('neutral');
  });

  it.each([
    [60, 'good'],
    [55, 'good'],
    [54, 'warn'],
    [30, 'warn'],
    [29, 'bad'],
    [0, 'bad'],
  ])('maps %p fps to %p', (fps, tone) => {
    expect(fpsTone(fps, true)).toBe(tone);
  });
});

describe('clsTone', () => {
  it.each([
    [0, 'good'],
    [0.1, 'good'],
    [0.11, 'warn'],
    [0.25, 'warn'],
    [0.26, 'bad'],
  ])('maps CLS %p to %p', (cls, tone) => {
    expect(clsTone(cls)).toBe(tone);
  });
});

describe('ratingTone', () => {
  it('maps Web Vitals ratings to tones', () => {
    expect(ratingTone('good')).toBe('good');
    expect(ratingTone('needs-improvement')).toBe('warn');
    expect(ratingTone('poor')).toBe('bad');
  });
});

describe('summarize', () => {
  it('returns null for an empty series', () => {
    expect(summarize([])).toBeNull();
  });

  it('computes min, avg and max', () => {
    expect(summarize([10, 30, 20])).toEqual({ min: 10, avg: 20, max: 30 });
  });

  it('handles a single sample', () => {
    expect(summarize([7])).toEqual({ min: 7, avg: 7, max: 7 });
  });
});

describe('formatPercent', () => {
  it('rounds a 0–1 ratio to a whole percentage', () => {
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(0.254)).toBe('25%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('shortUrl', () => {
  it('strips the origin of absolute URLs and keeps the query', () => {
    expect(shortUrl('https://api.example.com/users?page=2')).toBe('/users?page=2');
  });

  it('keeps relative paths', () => {
    expect(shortUrl('/api/items')).toBe('/api/items');
  });

  it('returns the input when it cannot be parsed', () => {
    expect(shortUrl('http://[invalid')).toBe('http://[invalid');
  });
});

describe('blockingTone', () => {
  it.each([
    [0, undefined],
    [1, 'warn'],
    [199, 'warn'],
    [200, 'bad'],
  ])('maps %pms blocked to %p', (ms, tone) => {
    expect(blockingTone(ms)).toBe(tone);
  });
});

describe('supportsLongAnimationFrames', () => {
  it('is false without PerformanceObserver', () => {
    expect(supportsLongAnimationFrames()).toBe(false);
  });
});

describe('describeFrame', () => {
  const script = (overrides: Partial<LongAnimationFrameScript> = {}): LongAnimationFrameScript => ({
    invokerType: null,
    invoker: null,
    sourceURL: null,
    sourceFunctionName: null,
    duration: 90.4,
    forcedStyleAndLayoutDuration: 0,
    pauseDuration: 0,
    ...overrides,
  });
  const frame = (scripts: LongAnimationFrameScript[]): LongAnimationFrameEntry => ({
    startTime: 0,
    duration: 130.6,
    blockingDuration: 80,
    renderStart: 0,
    styleAndLayoutStart: 0,
    firstUIEventTimestamp: 0,
    scripts,
    timestamp: 0,
  });

  it('falls back to the frame when no script is attributed', () => {
    expect(describeFrame(frame([]))).toEqual({
      primary: 'Unattributed frame',
      secondary: '131ms frame',
    });
  });

  it.each([
    [{ sourceFunctionName: 'onScroll' }, 'onScroll'],
    [{ sourceURL: 'https://cdn.test/vendor.js' }, '/vendor.js'],
    [{ invokerType: 'user-callback' }, 'user-callback'],
    [{}, 'Script'],
  ])('names %p as %p', (overrides, primary) => {
    expect(describeFrame(frame([script(overrides)])).primary).toBe(primary);
  });

  it('summarizes the script type, duration and source', () => {
    expect(describeFrame(frame([script({ sourceURL: '/app.js' })])).secondary).toBe(
      'script · 90ms · /app.js',
    );
  });
});
