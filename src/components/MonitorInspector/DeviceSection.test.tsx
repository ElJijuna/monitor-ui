import { render, screen } from '@testing-library/react';
import type { Monitor } from 'monitor-api';
import { useDevice } from 'monitor-api/react';
import { DeviceSection } from './DeviceSection';

jest.mock('monitor-api/react');

const monitor = {} as Monitor;
const mockedUseDevice = jest.mocked(useDevice);

describe('DeviceSection', () => {
  it('shows placeholders before the collector reports', () => {
    render(<DeviceSection monitor={monitor} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('reports an online device and its cores', () => {
    mockedUseDevice.mockReturnValueOnce({ hardwareConcurrency: 8, online: true, offlineCount: 0 });
    render(<DeviceSection monitor={monitor} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('A network is reachable')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('reports an offline device and how often it dropped', () => {
    mockedUseDevice.mockReturnValueOnce({ hardwareConcurrency: 4, online: false, offlineCount: 3 });
    render(<DeviceSection monitor={monitor} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
