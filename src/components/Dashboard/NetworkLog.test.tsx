import { render, screen } from '@testing-library/react'
import * as hooks from 'monitor-api/react'
import type { Monitor } from 'monitor-api'
import { NetworkLog } from './NetworkLog'

jest.mock('monitor-api/react')
jest.mock('monitor-api')

const monitor = {} as Monitor

function makeEntry(overrides: Partial<ReturnType<typeof hooks.useNetwork>['entries'][0]> = {}) {
  return {
    id: String(Math.random()), url: '/api/test', method: 'GET', status: 200,
    latency: 100, payloadSize: 512, error: false, timestamp: Date.now(),
    ...overrides,
  }
}

describe('NetworkLog', () => {
  it('shows empty state when no entries', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({ entries: [], window5s: { count: 0, avgLatency: 0, totalPayload: 0 } })
    render(<NetworkLog monitor={monitor} />)
    expect(screen.getByText('No requests yet')).toBeInTheDocument()
  })

  it('renders entry url', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [makeEntry({ url: '/api/users' })],
      window5s: { count: 1, avgLatency: 0, totalPayload: 0 },
    })
    render(<NetworkLog monitor={monitor} />)
    expect(screen.getByText('/api/users')).toBeInTheDocument()
  })

  it('limits to LOG_MAX_ENTRIES (20) most recent entries in reverse order', () => {
    const entries = Array.from({ length: 25 }, (_, i) =>
      makeEntry({ id: String(i), url: `/api/${i}` }),
    )
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries,
      window5s: { count: 25, avgLatency: 0, totalPayload: 0 },
    })
    render(<NetworkLog monitor={monitor} />)
    expect(screen.queryByText('/api/0')).not.toBeInTheDocument()
    expect(screen.getByText('/api/24')).toBeInTheDocument()
  })

  it('colors error status red', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [makeEntry({ status: 500, error: true })],
      window5s: { count: 1, avgLatency: 0, totalPayload: 0 },
    })
    const { container } = render(<NetworkLog monitor={monitor} />)
    const statusEl = container.querySelector('[color="error"]')
    expect(statusEl).toBeInTheDocument()
  })
})
