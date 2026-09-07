import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ErrorSnapshot, Monitor } from 'monitor-api';
import { useErrors } from 'monitor-api/react';
import { ErrorsSection } from './ErrorsSection';

jest.mock('monitor-api/react');

const clearLog = jest.fn();
const monitor = { errors: { clearLog } } as unknown as Monitor;
const mockedUseErrors = jest.mocked(useErrors);

describe('ErrorsSection', () => {
  beforeEach(() => {
    clearLog.mockClear();
    mockedUseErrors.mockReturnValue({ entries: [], totalErrors: 0, droppedErrors: 0 });
  });

  it('shows grouped error details and stack', async () => {
    mockedUseErrors.mockReturnValue({
      totalErrors: 3,
      droppedErrors: 1,
      entries: [
        {
          id: 'e1',
          source: 'error',
          details: { name: 'TypeError', message: 'Broken', stack: 'stack line' },
          timestamp: 1,
          lastSeenAt: 1,
          occurrences: 2,
        },
      ],
    } satisfies ErrorSnapshot);
    render(<ErrorsSection monitor={monitor} />);
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByText(/^×2 ·/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Broken'));
    expect(screen.getByText('stack line')).toBeInTheDocument();
  });

  it('only exposes clear when enabled', async () => {
    mockedUseErrors.mockReturnValue({
      entries: [
        {
          id: 'e1',
          source: 'manual',
          details: { name: 'Error', message: 'Broken', stack: null },
          timestamp: 1,
          lastSeenAt: 1,
          occurrences: 1,
        },
      ],
      totalErrors: 1,
      droppedErrors: 0,
    });
    const { rerender } = render(<ErrorsSection monitor={monitor} />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    rerender(<ErrorsSection allowClear monitor={monitor} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(clearLog).toHaveBeenCalledTimes(1);
  });
});
