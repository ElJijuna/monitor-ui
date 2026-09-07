import { pathToFileURL } from 'node:url';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ErrorSnapshot, Monitor } from 'monitor-api';

type CreateMonitor = (config?: unknown) => Monitor;
type UseErrors = (monitor: Monitor) => ErrorSnapshot;

// Keep import() native so ts-jest cannot rewrite this ESM contract test to require().
const importEsm = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<Record<string, unknown>>;

describe('monitor-api 1.4 integration', () => {
  it('updates the real errors hook, clears retained errors, and destroys cleanly', async () => {
    const api = await importEsm(
      pathToFileURL(`${process.cwd()}/node_modules/monitor-api/dist/index.js`).href,
    );
    const reactApi = await importEsm(
      pathToFileURL(`${process.cwd()}/node_modules/monitor-api/dist/react/index.js`).href,
    );
    const createMonitor = api.createMonitor as CreateMonitor;
    const useErrors = reactApi.useErrors as UseErrors;
    const monitor = createMonitor({
      collectors: {
        performance: false,
        network: false,
        react: false,
        events: false,
        webVitals: false,
        errors: true,
      },
    });

    monitor.start();
    const { result, unmount } = renderHook(() => useErrors(monitor));

    act(() => monitor.errors.capture(new Error('integration failure'), 'manual'));
    await waitFor(() => expect(result.current.totalErrors).toBe(1));
    expect(result.current.entries[0]?.details.message).toBe('integration failure');

    act(() => monitor.errors.clearLog());
    await waitFor(() => expect(result.current.entries).toHaveLength(0));
    expect(result.current.totalErrors).toBe(1);

    unmount();
    expect(() => monitor.destroy()).not.toThrow();
  });
});
