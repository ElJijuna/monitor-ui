import {
  connectionTone,
  formatBrowser,
  formatConnection,
  formatPlatform,
  formatScreen,
  formatSize,
} from './device';

const connection = { effectiveType: null, rtt: null, downlink: null, saveData: null };

describe('device formatters', () => {
  it('formats the browser with its major version when known', () => {
    expect(formatBrowser({ name: 'Edge', majorVersion: 127, mobile: false, platform: null })).toBe(
      'Edge 127',
    );
    expect(
      formatBrowser({ name: 'Safari', majorVersion: null, mobile: null, platform: null }),
    ).toBe('Safari');
    expect(
      formatBrowser({ name: null, majorVersion: 12, mobile: null, platform: null }),
    ).toBeNull();
  });

  it('formats the platform and form factor', () => {
    expect(formatPlatform({ name: null, majorVersion: null, mobile: true, platform: 'iOS' })).toBe(
      'iOS · mobile',
    );
    expect(
      formatPlatform({ name: null, majorVersion: null, mobile: null, platform: null }),
    ).toBeNull();
  });

  it('formats sizes only once both dimensions are known', () => {
    expect(formatSize({ width: 390, height: 844 })).toBe('390×844');
    expect(formatSize({ width: 390, height: null })).toBeNull();
    expect(formatScreen({ width: 390, height: 844, pixelRatio: 3 })).toBe('390×844 @3x');
    expect(formatScreen({ width: 1920, height: 1080, pixelRatio: 1.25 })).toBe('1920×1080 @1.25x');
    expect(formatScreen({ width: 1920, height: 1080, pixelRatio: null })).toBe('1920×1080');
  });

  it('formats the connection estimate', () => {
    expect(formatConnection({ effectiveType: '4g', rtt: 50, downlink: 10, saveData: true })).toBe(
      '4g · 50ms · 10 Mb/s · data saver',
    );
    expect(formatConnection(connection)).toBeNull();
  });

  it.each([
    [null, null],
    ['slow-2g', 'bad'],
    ['2g', 'bad'],
    ['3g', 'warn'],
    ['4g', 'good'],
  ])('grades %p as %p', (effectiveType, expected) => {
    expect(connectionTone({ ...connection, effectiveType })).toBe(expected);
  });
});
