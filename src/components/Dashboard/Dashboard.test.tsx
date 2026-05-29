import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as hooks from 'monitor-api/react'
import type { Monitor } from 'monitor-api'
import { Dashboard } from './Dashboard'

jest.mock('monitor-api/react')
jest.mock('monitor-api')

const monitor = {} as Monitor

describe('Dashboard', () => {
  it('renders the title', () => {
    render(<Dashboard monitor={monitor} title="My Dashboard" />)
    expect(screen.getByText('My Dashboard')).toBeInTheDocument()
  })

  it('renders Back button when onBack is provided', () => {
    render(<Dashboard monitor={monitor} onBack={jest.fn()} />)
    expect(screen.getByText('← Back')).toBeInTheDocument()
  })

  it('does not render Back button when onBack is undefined', () => {
    render(<Dashboard monitor={monitor} />)
    expect(screen.queryByText('← Back')).not.toBeInTheDocument()
  })

  it('calls onBack when Back button is clicked', async () => {
    const onBack = jest.fn()
    render(<Dashboard monitor={monitor} onBack={onBack} />)
    await userEvent.click(screen.getByText('← Back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders with default title Dashboard', () => {
    render(<Dashboard monitor={monitor} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
