import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Monitor } from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { MONITOR_METRIC_KINDS } from '@/components/Metrics';
import { deviceSnapshot } from '@/test-utils/deviceSnapshot';
import { MonitorPill } from './MonitorPill';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

const monitor = {
  events: { onEvent: { value: null } },
  errors: { onError: { value: null } },
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
  },
} as unknown as Monitor;

const device = (online: boolean | null) => deviceSnapshot({ hardwareConcurrency: 8, online });

beforeEach(() => {
  // Read signals as-is; the shared mock falls back to a reporter snapshot for null values.
  jest.mocked(hooks.useSignal).mockImplementation((signal) => signal.value);
  jest.mocked(hooks.useDevice).mockReturnValue(device(null));
});

describe('MonitorPill', () => {
  it('shows the frame rate pill by default', () => {
    render(<MonitorPill monitor={monitor} />);
    const widget = screen.getByRole('group', { name: 'FPS' });

    expect(widget).toHaveAttribute('data-size', 'pill');
  });

  it('keeps performance as an alias of fps', () => {
    render(<MonitorPill monitor={monitor} scope="performance" />);
    expect(screen.getByRole('group', { name: 'FPS' })).toBeInTheDocument();
  });

  it.each([
    ['network', 'Network'],
    ['errors', 'Errors'],
    ['webVitals', 'Web Vitals'],
    ['resources', 'Resources'],
    ['reporter', 'Reporter'],
    ['device', 'Device'],
  ] as const)('renders the %p widget as a pill', (scope, name) => {
    render(<MonitorPill monitor={monitor} scope={scope} />);
    expect(screen.getByRole('group', { name })).toHaveAttribute('data-size', 'pill');
  });

  it.each(MONITOR_METRIC_KINDS)('is a button for the %p scope', (scope) => {
    render(<MonitorPill monitor={monitor} scope={scope} />);
    expect(screen.getByRole('button', { name: 'Open monitor' })).toBeInTheDocument();
  });

  it('calls onClick when activated', async () => {
    const onClick = jest.fn();

    render(<MonitorPill monitor={monitor} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open monitor' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('names the button with label, or aria-label when given', () => {
    const { rerender } = render(<MonitorPill label="Ver métricas" monitor={monitor} />);

    expect(screen.getByRole('button', { name: 'Ver métricas' })).toBeInTheDocument();

    rerender(<MonitorPill aria-label="Monitor" label="Ver métricas" monitor={monitor} />);
    expect(screen.getByRole('button', { name: 'Monitor' })).toBeInTheDocument();
  });

  it('merges className and DOM props on the wrapper', () => {
    const { container } = render(
      <MonitorPill className="custom" data-testid="pill" monitor={monitor} />,
    );

    expect(container.firstChild).toHaveClass('monitor-pill', 'custom');
    expect(screen.getByTestId('pill')).toBe(container.firstChild);
  });

  it('flags an offline device in every scope, including the accessible name', () => {
    jest.mocked(hooks.useDevice).mockReturnValue(device(false));
    render(<MonitorPill monitor={monitor} scope="events" />);

    expect(screen.getByText('offline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open monitor, offline' })).toBeInTheDocument();
  });

  it.each([true, null])('shows no offline chip while online is %p', (online) => {
    jest.mocked(hooks.useDevice).mockReturnValue(device(online));
    render(<MonitorPill monitor={monitor} />);

    expect(screen.queryByText('offline')).not.toBeInTheDocument();
  });
});
