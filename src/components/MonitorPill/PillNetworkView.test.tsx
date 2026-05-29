import { render, screen } from '@testing-library/react'
import * as hooks from 'monitor-api/react'
import type { Monitor } from 'monitor-api'
import { PillNetworkView } from './PillNetworkView'

jest.mock('monitor-api/react')
jest.mock('monitor-api')

const monitor = {} as Monitor

function makeEntry(overrides: Partial<ReturnType<typeof hooks.useNetwork>['entries'][0]> = {}) {
  return {
    id: '1', url: '/api/test', method: 'GET', status: 200,
    latency: 50, payloadSize: 1024, error: false, timestamp: Date.now(),
    ...overrides,
  }
}

describe('PillNetworkView', () => {
  it('shows request count from window5s', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [],
      window5s: { count: 5, avgLatency: 0, totalPayload: 0 },
    })
    render(<PillNetworkView monitor={monitor} />)
    expect(screen.getByText(/5 req/)).toBeInTheDocument()
  })

  it('shows formatted payload from window5s', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [],
      window5s: { count: 1, avgLatency: 0, totalPayload: 2048 },
    })
    render(<PillNetworkView monitor={monitor} />)
    expect(screen.getByText('2 KB')).toBeInTheDocument()
  })

  it('shows — when no recent errors', () => {
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [makeEntry({ status: 200, error: false })],
      window5s: { count: 1, avgLatency: 0, totalPayload: 0 },
    })
    render(<PillNetworkView monitor={monitor} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows error count for recent failed requests', () => {
    const recentTs = Date.now() - 100
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [
        makeEntry({ status: 500, error: true, timestamp: recentTs }),
        makeEntry({ status: 404, error: false, timestamp: recentTs }),
      ],
      window5s: { count: 2, avgLatency: 0, totalPayload: 0 },
    })
    render(<PillNetworkView monitor={monitor} />)
    expect(screen.getByText('2 err')).toBeInTheDocument()
  })

  it('ignores errors older than the recent window', () => {
    const oldTs = Date.now() - 10_000
    jest.mocked(hooks.useNetwork).mockReturnValue({
      entries: [makeEntry({ status: 500, error: true, timestamp: oldTs })],
      window5s: { count: 0, avgLatency: 0, totalPayload: 0 },
    })
    render(<PillNetworkView monitor={monitor} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
