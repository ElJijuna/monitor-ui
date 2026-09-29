import { render, screen } from '@testing-library/react';
import type { Monitor } from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { MonitorInspector } from './MonitorInspector';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

const monitor = {
  events: { onEvent: { value: null } },
  errors: { onError: { value: null }, clearLog: jest.fn() },
  reporter: {
    snapshot: {
      value: {
        status: 'idle',
        attempts: 0,
        sent: 0,
        failed: 0,
        dropped: 0,
        retries: 0,
        cancelled: 0,
        skipped: 0,
        lastSuccessAt: null,
        lastFailure: null,
      },
    },
    flush: jest.fn(),
  },
} as unknown as Monitor;

/** The metric widgets, not the `<details>` disclosures that also have the group role. */
const widgets = () =>
  screen.getAllByRole('group').filter((group) => group.classList.contains('monitor-metric'));

beforeEach(() => {
  // Read signals as-is; the shared mock falls back to a reporter snapshot for null values.
  jest.mocked(hooks.useSignal).mockImplementation((signal) => signal.value);
});

describe('MonitorInspector', () => {
  it('stacks every metric widget, expanded, health first', () => {
    render(<MonitorInspector monitor={monitor} />);

    expect(widgets().map((widget) => widget.getAttribute('aria-label'))).toEqual([
      'Health',
      'FPS',
      'JS Heap',
      'Web Vitals',
      'Network',
      'Resources',
      'React',
      'Events',
      'Errors',
      'Reporter',
    ]);
    expect(widgets().every((widget) => widget.hasAttribute('data-expanded'))).toBe(true);
  });

  it('hides the errors and reporter widgets', () => {
    render(<MonitorInspector monitor={monitor} showErrors={false} showReporter={false} />);
    const names = widgets().map((widget) => widget.getAttribute('aria-label'));

    expect(names).not.toContain('Errors');
    expect(names).not.toContain('Reporter');
  });

  it('forwards the clear and flush actions', () => {
    render(<MonitorInspector allowClearErrors allowFlushReport monitor={monitor} />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Send now')).toBeInTheDocument();
  });

  it('shows device chips once the collector reports', () => {
    jest.mocked(hooks.useDevice).mockReturnValue({
      hardwareConcurrency: 4,
      online: true,
      offlineCount: 0,
    });
    const { container } = render(<MonitorInspector monitor={monitor} />);
    const chips = container.querySelectorAll('.monitor-device__chip');

    // Health's Connection row also reads "Online", so check the chips themselves.
    expect(chips[0]).toHaveTextContent('Online');
    expect(chips[0]).toHaveAttribute('data-tone', 'good');
    expect(chips[1]).toHaveTextContent('4 cores');
    // Back to the unreported device for any later test.
    jest.mocked(hooks.useDevice).mockReturnValue({
      hardwareConcurrency: null,
      online: null,
      offlineCount: 0,
    });
  });

  it('applies custom className', () => {
    const { container } = render(<MonitorInspector className="custom" monitor={monitor} />);

    expect(container.firstChild).toHaveClass('monitor-inspector', 'custom');
  });
});
