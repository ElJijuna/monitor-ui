import { render, screen } from '@testing-library/react';
import type { Monitor } from 'monitor-api';
import * as hooks from 'monitor-api/react';
import { MonitorPill } from './MonitorPill';

jest.mock('monitor-api/react');
jest.mock('monitor-api');

const monitor = {} as Monitor;

beforeEach(() => {
  jest.mocked(hooks.usePerformance).mockReturnValue({
    fps: 60,
    fpsHistory: [60],
    memory: { used: 42, total: 128, percent: 32.8 },
    memoryHistory: [32],
    longTasks: { count: 0, lastDuration: null },
    cls: 0,
  });
  jest.mocked(hooks.useNetwork).mockReturnValue({
    entries: [],
    window5s: { count: 3, avgLatency: 50, totalPayload: 2048, errorRate: 0 },
  });
  jest.mocked(hooks.useEvents).mockReturnValue({
    entries: [],
    byLabel: {},
  });
  jest.mocked(hooks.useErrors).mockReturnValue({
    entries: [],
    totalErrors: 2,
    droppedErrors: 0,
  });
});

describe('MonitorPill', () => {
  it('renders with default performance scope showing fps', () => {
    render(<MonitorPill monitor={monitor} />);
    expect(screen.getByText(/fps/i)).toBeInTheDocument();
  });

  it('renders network scope showing req', () => {
    render(<MonitorPill monitor={monitor} scope="network" />);
    expect(screen.getByText(/req/i)).toBeInTheDocument();
  });

  it('renders events scope showing evt', () => {
    render(<MonitorPill monitor={monitor} scope="events" />);
    expect(screen.getByText(/evt/i)).toBeInTheDocument();
  });

  it('renders errors scope showing the lifetime total', () => {
    render(<MonitorPill monitor={monitor} scope="errors" />);
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('uses label as aria-label on the pill container', () => {
    const { container } = render(<MonitorPill monitor={monitor} label="Ver métricas" />);

    expect(container.firstChild).toHaveAttribute('aria-label', 'Ver métricas');
  });
});
