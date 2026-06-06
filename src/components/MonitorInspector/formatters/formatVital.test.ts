import { formatVital, VITAL_FULL_NAMES, VITAL_ORDER } from './formatVital';

describe('formatVital', () => {
  it('formats CLS with 3 decimal places', () => {
    expect(formatVital('CLS', 0.105)).toBe('0.105');
    expect(formatVital('CLS', 0.1)).toBe('0.100');
  });

  it('formats sub-second vitals in ms', () => {
    expect(formatVital('LCP', 800)).toBe('800ms');
    expect(formatVital('FCP', 0)).toBe('0ms');
    expect(formatVital('TTFB', 999)).toBe('999ms');
  });

  it('formats vitals >= 1000ms in seconds', () => {
    expect(formatVital('LCP', 2500)).toBe('2.5s');
    expect(formatVital('INP', 1000)).toBe('1.0s');
  });
});

describe('VITAL_ORDER', () => {
  it('contains all 5 web vitals', () => {
    expect(VITAL_ORDER).toHaveLength(5);
    expect(VITAL_ORDER).toEqual(expect.arrayContaining(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']));
  });
});

describe('VITAL_FULL_NAMES', () => {
  it('maps all vital abbreviations to full names', () => {
    expect(VITAL_FULL_NAMES.LCP).toBe('Largest Contentful Paint');
    expect(VITAL_FULL_NAMES.INP).toBe('Interaction to Next Paint');
    expect(VITAL_FULL_NAMES.CLS).toBe('Cumulative Layout Shift');
    expect(VITAL_FULL_NAMES.FCP).toBe('First Contentful Paint');
    expect(VITAL_FULL_NAMES.TTFB).toBe('Time to First Byte');
  });
});
