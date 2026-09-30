import type { DeviceSnapshot } from 'monitor-api';

/** Test fixture: a device snapshot as the collector reports it before `start()`, plus overrides. */
export function deviceSnapshot(overrides: Partial<DeviceSnapshot> = {}): DeviceSnapshot {
  return {
    hardwareConcurrency: null,
    deviceMemory: null,
    online: null,
    offlineCount: 0,
    browser: { name: null, majorVersion: null, mobile: null, platform: null },
    language: null,
    timeZone: null,
    screen: { width: null, height: null, pixelRatio: null },
    viewport: { width: null, height: null },
    connection: { effectiveType: null, rtt: null, downlink: null, saveData: null },
    colorScheme: null,
    reducedMotion: null,
    ...overrides,
  };
}
