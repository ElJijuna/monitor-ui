import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Monitor, ReporterSnapshot } from 'monitor-api';
import { useSignal } from 'monitor-api/react';
import { ReporterSection } from './ReporterSection';

jest.mock('monitor-api/react');

const flush = jest.fn();
const monitor = { reporter: { snapshot: {}, flush } } as unknown as Monitor;
const mockedUseSignal = jest.mocked(useSignal);
const snapshot: ReporterSnapshot = {
  status: 'idle',
  attempts: 2,
  sent: 1,
  failed: 1,
  dropped: 0,
  retries: 1,
  cancelled: 0,
  skipped: 0,
  lastSuccessAt: null,
  lastFailure: 'transport',
};

describe('ReporterSection', () => {
  beforeEach(() => {
    mockedUseSignal.mockReturnValue(snapshot);
    flush.mockReset();
  });

  it('keeps the action opt-in', () => {
    render(<ReporterSection monitor={monitor} />);
    expect(screen.getByText('idle')).toBeInTheDocument();
    expect(screen.queryByText('Send now')).not.toBeInTheDocument();
  });

  it('reports successful, false, and rejected flushes without throwing', async () => {
    const user = userEvent.setup();

    flush
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error('nope'));
    render(<ReporterSection allowFlush monitor={monitor} />);
    await user.click(screen.getByText('Send now'));
    expect(await screen.findByText('Report sent')).toBeInTheDocument();
    await user.click(screen.getByText('Send now'));
    expect(await screen.findByText('Report was not sent')).toBeInTheDocument();
    await user.click(screen.getByText('Send now'));
    expect(await screen.findByText('Report failed')).toBeInTheDocument();
  });

  it('disables flush unless the reporter is idle', () => {
    mockedUseSignal.mockReturnValue({ ...snapshot, status: 'retrying' });
    render(<ReporterSection allowFlush monitor={monitor} />);
    expect(screen.getByText('Send now')).toBeDisabled();
  });
});
