/*
  Storybook-only helpers: a live monitor fed with synthetic traffic.
  Not exported from the package entry point.
*/
import type { Monitor } from 'monitor-api';
import { createMonitor, emitMonitorEvent } from 'monitor-api';
import { useEffect, useMemo } from 'react';

const MOCK_ENDPOINTS = [
  { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/users/1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/todos?_limit=10', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/comments?postId=1', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/albums/1/photos', method: 'GET' },
  { url: 'https://jsonplaceholder.typicode.com/posts', method: 'POST' },
  { url: 'https://jsonplaceholder.typicode.com/posts/999', method: 'GET' }, // 404
] as const;

const EVENT_LABELS = ['user:login', 'route:change', 'cache:miss', 'cart:add', 'api:retry'];

const ERROR_SAMPLES = [
  () => new TypeError("Cannot read properties of undefined (reading 'id')"),
  () => new RangeError('Maximum call stack size exceeded'),
  () => new Error('ChunkLoadError: Loading chunk 42 failed'),
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export interface DemoMonitorOptions {
  /** Fires fetch/XHR requests against jsonplaceholder (one 404 endpoint included). */
  requests?: boolean;
  /** Emits custom events with a small payload. */
  events?: boolean;
  /** Captures synthetic errors; repeated messages exercise monitor-api's deduplication. */
  errors?: boolean;
  /** Enables production reporting through a flaky in-memory transport with retries. */
  reporter?: boolean;
  /** Blocks the main thread now and then, producing long animation frames (Chromium 123+). */
  jank?: boolean;
}

/** Busy-waits so the frame turns into a long animation frame attributed to the timer. */
function blockMainThread(ms: number) {
  const end = performance.now() + ms;

  while (performance.now() < end) {
    // Intentionally blocking.
  }
}

/**
 * Creates and starts a monitor for a story.
 *
 * The React collector stays disabled: observing the story's own commits would
 * re-render the widgets that display them, creating a feedback loop.
 */
export function useDemoMonitor({
  requests = true,
  events = true,
  errors = true,
  reporter = true,
  jank = true,
}: DemoMonitorOptions = {}): Monitor {
  const monitor = useMemo<Monitor>(
    () =>
      createMonitor({
        collectors: {
          performance: true,
          network: true,
          events: { maxHistory: 200 },
          webVitals: { reportAllChanges: true, attribution: true },
          errors: { maxHistory: 25, dedupWindow: 4_000 },
          resources: true,
          react: false,
        },
        maxHistory: 120,
        ...(reporter && {
          env: 'production' as const,
          report: {
            endpoint: 'memory://storybook',
            interval: 4_000,
            timeout: 1_500,
            retry: { maxAttempts: 2, delay: 400 },
            // Fails ~25% of deliveries so the reporter widgets show retries and failures.
            transport: () =>
              new Promise<void>((resolve, reject) => {
                window.setTimeout(
                  () => (Math.random() < 0.25 ? reject(new Error('503')) : resolve()),
                  150 + Math.random() * 400,
                );
              }),
          },
        }),
      }),
    [reporter],
  );

  useEffect(() => {
    monitor.start();

    const timers: number[] = [];

    if (events) {
      timers.push(
        window.setInterval(() => {
          emitMonitorEvent(pick(EVENT_LABELS), { at: Date.now(), source: 'storybook' });
        }, 1_400),
      );
    }

    if (errors) {
      timers.push(
        window.setInterval(() => {
          monitor.errors.capture(
            pick(ERROR_SAMPLES)(),
            Math.random() < 0.3 ? 'unhandledrejection' : 'manual',
          );
        }, 3_500),
      );
    }

    if (jank) {
      timers.push(window.setInterval(() => blockMainThread(90 + Math.random() * 170), 5_000));
    }

    return () => {
      for (const timer of timers) {
        window.clearInterval(timer);
      }

      monitor.stop();
    };
  }, [monitor, events, errors, jank]);

  useMockRequests(requests);

  return monitor;
}

function useMockRequests(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function fire() {
      const endpoint = pick(MOCK_ENDPOINTS);

      try {
        await fetch(endpoint.url, {
          signal: controller.signal,
          method: endpoint.method,
          ...(endpoint.method === 'POST' && {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'mock', body: 'test', userId: 1 }),
          }),
        });
      } catch {
        // Network failures are captured by monitor-api as well.
      }

      if (!controller.signal.aborted) {
        timeoutId = setTimeout(fire, 600 + Math.random() * 1_400);
      }
    }

    fire();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [enabled]);
}
