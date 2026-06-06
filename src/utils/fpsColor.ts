export function fpsColor(fps: number): string {
  if (fps >= 55) {
    return 'var(--monitor-color-fps-good, #4ade80)';
  }

  if (fps >= 30) {
    return 'var(--monitor-color-fps-warn, #facc15)';
  }

  return 'var(--monitor-color-fps-bad, #f87171)';
}

export function latencyColor(ms: number): string {
  if (ms > 500) {
    return 'var(--monitor-color-latency-high, #f87171)';
  }

  return 'var(--monitor-color-status-ok, #4ade80)';
}

export function memoryColor(usedPct: number): string {
  if (usedPct > 80) {
    return 'var(--monitor-color-status-error, #f87171)';
  }

  return 'var(--monitor-color-memory, #60a5fa)';
}
