import { fpsColor, latencyColor, memoryColor } from './fpsColor';

describe('fpsColor', () => {
  it('returns good color for fps >= 55', () => {
    expect(fpsColor(60)).toBe('var(--monitor-color-fps-good, #4ade80)');
    expect(fpsColor(55)).toBe('var(--monitor-color-fps-good, #4ade80)');
  });

  it('returns warn color for fps in 30–54 range', () => {
    expect(fpsColor(40)).toBe('var(--monitor-color-fps-warn, #facc15)');
    expect(fpsColor(30)).toBe('var(--monitor-color-fps-warn, #facc15)');
    expect(fpsColor(54)).toBe('var(--monitor-color-fps-warn, #facc15)');
  });

  it('returns bad color for fps < 30', () => {
    expect(fpsColor(20)).toBe('var(--monitor-color-fps-bad, #f87171)');
    expect(fpsColor(0)).toBe('var(--monitor-color-fps-bad, #f87171)');
  });
});

describe('latencyColor', () => {
  it('returns ok color for latency <= 500ms', () => {
    expect(latencyColor(0)).toBe('var(--monitor-color-status-ok, #4ade80)');
    expect(latencyColor(500)).toBe('var(--monitor-color-status-ok, #4ade80)');
    expect(latencyColor(200)).toBe('var(--monitor-color-status-ok, #4ade80)');
  });

  it('returns high color for latency > 500ms', () => {
    expect(latencyColor(501)).toBe('var(--monitor-color-latency-high, #f87171)');
    expect(latencyColor(1000)).toBe('var(--monitor-color-latency-high, #f87171)');
  });
});

describe('memoryColor', () => {
  it('returns memory color for usage <= 80%', () => {
    expect(memoryColor(50)).toBe('var(--monitor-color-memory, #60a5fa)');
    expect(memoryColor(80)).toBe('var(--monitor-color-memory, #60a5fa)');
  });

  it('returns error color for usage > 80%', () => {
    expect(memoryColor(81)).toBe('var(--monitor-color-status-error, #f87171)');
    expect(memoryColor(100)).toBe('var(--monitor-color-status-error, #f87171)');
  });
});
