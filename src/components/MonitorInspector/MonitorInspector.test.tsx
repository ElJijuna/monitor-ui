import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as hooks from 'monitor-api/react'
import type { Monitor } from 'monitor-api'
import { MonitorInspector } from './MonitorInspector'

jest.mock('monitor-api/react')
jest.mock('monitor-api')

const monitor = {} as Monitor

describe('MonitorInspector', () => {
  it('renders the title', () => {
    render(<MonitorInspector monitor={monitor} title="My Monitor" />)
    expect(screen.getByText('My Monitor')).toBeInTheDocument()
  })

  it('renders Close button when onClose is provided', () => {
    render(<MonitorInspector monitor={monitor} onClose={jest.fn()} />)
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('does not render Close button when onClose is undefined', () => {
    render(<MonitorInspector monitor={monitor} />)
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('renders Dashboard button when onOpenDashboard is provided', () => {
    render(<MonitorInspector monitor={monitor} onOpenDashboard={jest.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('does not render Dashboard button when onOpenDashboard is undefined', () => {
    render(<MonitorInspector monitor={monitor} />)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', async () => {
    const onClose = jest.fn()
    render(<MonitorInspector monitor={monitor} onClose={onClose} />)
    await userEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenDashboard when Dashboard button is clicked', async () => {
    const onOpenDashboard = jest.fn()
    render(<MonitorInspector monitor={monitor} onOpenDashboard={onOpenDashboard} />)
    await userEvent.click(screen.getByText('Dashboard'))
    expect(onOpenDashboard).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<MonitorInspector monitor={monitor} className="custom" />)
    expect(container.firstChild).toHaveClass('monitor-inspector', 'custom')
  })
})
