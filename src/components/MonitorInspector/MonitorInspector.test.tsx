import { render, screen } from '@testing-library/react'
import * as hooks from 'monitor-api/react'
import type { Monitor } from 'monitor-api'
import { MonitorInspector } from './MonitorInspector'

jest.mock('monitor-api/react')
jest.mock('monitor-api')

const monitor = {} as Monitor

describe('MonitorInspector', () => {
  it('does not render a header title', () => {
    render(<MonitorInspector monitor={monitor} />)
    expect(screen.queryByText('Monitor')).not.toBeInTheDocument()
  })

  it('does not render header actions', () => {
    render(<MonitorInspector monitor={monitor} />)
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<MonitorInspector monitor={monitor} className="custom" />)
    expect(container.firstChild).toHaveClass('monitor-inspector', 'custom')
  })
})
