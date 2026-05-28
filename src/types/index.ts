export interface NetworkEntry {
  url: string
  status: number
  latency: number
  size: number
  ts: number
}

export interface MonitorEvent {
  ts: number
  label: string
  data?: Record<string, unknown>
}

export interface MonitorHistory {
  fps: number[]
  memory: number[]
  latency: number[]
}

export interface MonitorData {
  fps: number
  memory: {
    used: number | null
    total: number | null
  }
  network: {
    requests: number
    latency: number
    payloadKB: number
  }
  events: MonitorEvent[]
}
