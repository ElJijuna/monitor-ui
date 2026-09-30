import type { BrowserInfo, ConnectionInfo, ScreenInfo, ViewportInfo } from 'monitor-api';

/*
  Formatters for the device snapshot. Every field can be null (before `start()`, outside
  browsers, or where the browser does not expose it), so each helper returns null when there
  is nothing to show and callers skip the row or chip.
*/

/** `Chrome 128`, `Safari`, or null if the browser was not recognized. */
export function formatBrowser({ name, majorVersion }: BrowserInfo): string | null {
  if (!name) {
    return null;
  }

  return majorVersion === null ? name : `${name} ${majorVersion}`;
}

/** `macOS`, `Android · mobile`, or null if neither the OS nor the form factor is known. */
export function formatPlatform({ platform, mobile }: BrowserInfo): string | null {
  const parts = [platform, mobile === null ? null : mobile ? 'mobile' : 'desktop'];
  const known = parts.filter(Boolean);

  return known.length > 0 ? known.join(' · ') : null;
}

/** `1920×1080`, or null until both dimensions are known. */
export function formatSize({
  width,
  height,
}: Pick<ScreenInfo | ViewportInfo, 'width' | 'height'>): string | null {
  return width === null || height === null ? null : `${width}×${height}`;
}

/** `1920×1080 @2x`; the pixel ratio also changes with browser zoom. */
export function formatScreen(screen: ScreenInfo): string | null {
  const size = formatSize(screen);

  if (size === null || screen.pixelRatio === null) {
    return size;
  }

  return `${size} @${Number(screen.pixelRatio.toFixed(2))}x`;
}

/** `4g · 50ms · 10 Mb/s · data saver`, or null where the Network Information API is missing. */
export function formatConnection({
  effectiveType,
  rtt,
  downlink,
  saveData,
}: ConnectionInfo): string | null {
  const parts = [
    effectiveType,
    rtt === null ? null : `${rtt}ms`,
    downlink === null ? null : `${downlink} Mb/s`,
    saveData ? 'data saver' : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * Connection quality from the browser's estimate: `slow-2g` and `2g` are too slow for most
 * pages, `3g` is noticeably slow. Null when the estimate is not available.
 */
export function connectionTone({ effectiveType }: ConnectionInfo): 'good' | 'warn' | 'bad' | null {
  switch (effectiveType) {
    case null:
      return null;
    case 'slow-2g':
    case '2g':
      return 'bad';
    case '3g':
      return 'warn';
    default:
      return 'good';
  }
}
