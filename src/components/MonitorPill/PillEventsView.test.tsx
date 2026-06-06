import { render, screen } from '@testing-library/react';
import type { Monitor } from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { PillEventsView } from './PillEventsView';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

const monitor = {} as Monitor;

function makeEvent(label: string, timestamp = Date.now()) {
  return { id: '1', label, timestamp, data: {} };
}

describe('PillEventsView', () => {
  it('shows event count', () => {
    jest.mocked(hooks.useEvents).mockReturnValue({
      entries: [makeEvent('user:login'), makeEvent('route:change')],
      labelStats: new Map(),
    });
    render(<PillEventsView monitor={monitor} />);
    expect(screen.getByText(/2 evt/)).toBeInTheDocument();
  });

  it('shows "no events" when entries are empty', () => {
    jest.mocked(hooks.useEvents).mockReturnValue({ entries: [], labelStats: new Map() });
    render(<PillEventsView monitor={monitor} />);
    expect(screen.getByText('no events')).toBeInTheDocument();
  });

  it('shows label of last event when short enough', () => {
    jest.mocked(hooks.useEvents).mockReturnValue({
      entries: [makeEvent('user:login')],
      labelStats: new Map(),
    });
    render(<PillEventsView monitor={monitor} />);
    expect(screen.getByText('user:login')).toBeInTheDocument();
  });

  it('truncates label longer than 16 chars with ellipsis', () => {
    jest.mocked(hooks.useEvents).mockReturnValue({
      entries: [makeEvent('very-long-event-label-that-exceeds-limit')],
      labelStats: new Map(),
    });
    render(<PillEventsView monitor={monitor} />);
    expect(screen.getByText('very-long-even…')).toBeInTheDocument();
  });

  it('shows — in trailing when no events', () => {
    jest.mocked(hooks.useEvents).mockReturnValue({ entries: [], labelStats: new Map() });
    render(<PillEventsView monitor={monitor} />);
    const trailing = screen.getAllByText('—');

    expect(trailing.length).toBeGreaterThan(0);
  });
});
