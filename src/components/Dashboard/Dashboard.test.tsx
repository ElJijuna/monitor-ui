import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Monitor } from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { Dashboard } from './Dashboard';

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

beforeEach(() => {
  // Read signals as-is; the shared mock falls back to a reporter snapshot for null values.
  jest.mocked(hooks.useSignal).mockImplementation((signal) => signal.value);
});

describe('Dashboard', () => {
  it('renders the title', () => {
    render(<Dashboard monitor={monitor} title="My Dashboard" />);
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
  });

  it('renders Back button when onBack is provided', () => {
    render(<Dashboard monitor={monitor} onBack={jest.fn()} />);
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  it('does not render Back button when onBack is undefined', () => {
    render(<Dashboard monitor={monitor} />);
    expect(screen.queryByText('← Back')).not.toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', async () => {
    const onBack = jest.fn();

    render(<Dashboard monitor={monitor} onBack={onBack} />);
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders with default title Dashboard', () => {
    render(<Dashboard monitor={monitor} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('lays out every metric widget, featuring the ones with drill-down panels', () => {
    const { container } = render(<Dashboard monitor={monitor} />);
    const names = screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));

    expect(names).toEqual([
      'FPS',
      'JS Heap',
      'Network',
      'Resources',
      'Web Vitals',
      'Events',
      'Errors',
      'Reporter',
      'React',
    ]);
    expect(
      [...container.querySelectorAll('.monitor-dashboard__featured')].map((el) =>
        el.getAttribute('aria-label'),
      ),
    ).toEqual(['FPS', 'Network', 'Web Vitals', 'Errors']);
  });

  it('hides the diagnostics widgets and forwards their actions', () => {
    const { rerender } = render(
      <Dashboard monitor={monitor} showErrors={false} showReporter={false} />,
    );

    expect(screen.queryByRole('group', { name: 'Errors' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Reporter' })).not.toBeInTheDocument();

    rerender(<Dashboard allowClearErrors allowFlushReport monitor={monitor} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Send now')).toBeInTheDocument();
  });

  it('shows no device chips before the collector reports', () => {
    const { container } = render(<Dashboard monitor={monitor} />);

    expect(container.querySelector('.monitor-dashboard__device')).toBeNull();
  });

  it('shows connectivity and CPU chips in the header', () => {
    jest.mocked(hooks.useDevice).mockReturnValue({
      hardwareConcurrency: 8,
      online: false,
      offlineCount: 2,
    });
    render(<Dashboard monitor={monitor} />);

    expect(screen.getByText('Offline · 2 drops')).toHaveAttribute('data-tone', 'bad');
    expect(screen.getByText('8 cores')).toBeInTheDocument();
    // Back to the unreported device for any later test.
    jest.mocked(hooks.useDevice).mockReturnValue({
      hardwareConcurrency: null,
      online: null,
      offlineCount: 0,
    });
  });
});

