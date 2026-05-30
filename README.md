# monitor-ui

[![npm version](https://img.shields.io/npm/v/monitor-ui)](https://www.npmjs.com/package/monitor-ui)
[![npm downloads](https://img.shields.io/npm/dm/monitor-ui)](https://www.npmjs.com/package/monitor-ui)
[![license](https://img.shields.io/npm/l/monitor-ui)](./LICENSE)
[![CI](https://github.com/ElJijuna/monitor-ui/actions/workflows/release.yml/badge.svg)](https://github.com/ElJijuna/monitor-ui/actions/workflows/release.yml)

Three-level React UI for [monitor-api](https://www.npmjs.com/package/monitor-api): a compact pill that shows live metrics, an inspector panel with detailed sections, and a full dashboard with charts and tables. Each level is independently usable or wired together into a drill-down flow.

![monitor-ui dashboard demo](https://raw.githubusercontent.com/ElJijuna/monitor-ui/main/public/assets/dashboard.gif)

```
MonitorPill  →  MonitorInspector  →  Dashboard
   (pill)          (inspector)        (full view)
```

## Installation

```bash
npm install monitor-ui monitor-api
```

**Peer dependencies** (install if not already present):

```bash
npm install react react-dom \
  @gnome-ui/react @gnome-ui/core @gnome-ui/hooks \
  @gnome-ui/charts @gnome-ui/layout
```

## Usage

### 1. MonitorPill — compact live indicator

A small interactive button that shows a live metric at a glance. Click it to open the inspector.

```tsx
import { useEffect, useMemo, useState } from 'react'
import { createMonitor } from 'monitor-api'
import { MonitorPill, MonitorInspector } from 'monitor-ui'

export function App() {
  const monitor = useMemo(() => createMonitor({ maxHistory: 120 }), [])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    monitor.start()
    return () => monitor.destroy()
  }, [monitor])

  return (
    <>
      <MonitorPill monitor={monitor} scope="performance" onClick={() => setOpen(true)} />
      {open && <MonitorInspector monitor={monitor} />}
    </>
  )
}
```

**`scope` values:** `"performance"` (default) · `"network"` · `"events"`

### 2. MonitorInspector — detailed panel

A panel with collapsible sections: performance, Web Vitals, network, React internals, and custom events.

```tsx
<MonitorInspector monitor={monitor} />
```

### 3. Dashboard — full view

A full-page dashboard with KPI cards, time-series charts, a network log, and an events log.

```tsx
<Dashboard
  monitor={monitor}
  title="Performance Dashboard"
  onBack={() => setView('inspector')}
/>
```

### Complete drill-down example

```tsx
import { useEffect, useMemo, useState } from 'react'
import { createMonitor } from 'monitor-api'
import { MonitorPill, MonitorInspector, Dashboard } from 'monitor-ui'

type View = 'pill' | 'inspector' | 'dashboard'

export function MonitorFlow() {
  const monitor = useMemo(() => createMonitor({ maxHistory: 120 }), [])
  const [view, setView] = useState<View>('pill')

  useEffect(() => {
    monitor.start()
    return () => monitor.destroy()
  }, [monitor])

  if (view === 'dashboard') {
    return <Dashboard monitor={monitor} onBack={() => setView('inspector')} />
  }

  if (view === 'inspector') {
    return (
      <>
        <button type="button" onClick={() => setView('pill')}>Close</button>
        <button type="button" onClick={() => setView('dashboard')}>Dashboard</button>
        <MonitorInspector monitor={monitor} />
      </>
    )
  }

  return <MonitorPill monitor={monitor} onClick={() => setView('inspector')} />
}
```

## API

### `MonitorPill`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance from `monitor-api` |
| `scope` | `'performance' \| 'network' \| 'events'` | `'performance'` | Which metric to display |
| `label` | `string` | `'Open monitor'` | Accessible label |
| `...button` | `ButtonHTMLAttributes` | — | All native button props |

### `MonitorInspector`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance |
| `...div` | `HTMLAttributes<HTMLDivElement>` except `title` | — | Native div props |

### `Dashboard`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance |
| `title` | `string` | `'Dashboard'` | Dashboard heading |
| `onBack` | `() => void` | — | Shows a Back button when provided |

## Utility exports

```ts
import {
  fpsColor,       // (fps: number) => string — CSS color for FPS value
  latencyColor,   // (ms: number) => string — CSS color for latency value
  memoryColor,    // (ratio: number) => string — CSS color for memory ratio
  formatBytes,    // (bytes: number) => string — e.g. "42.1 MB"
  formatMemory,   // (bytes: number) => string — heap-aware formatting
  formatTime,     // (ms: number) => string — e.g. "1.2s" or "340ms"
  toChartData,    // (history: Sample[]) => ChartData
} from 'monitor-ui'
```

## License

MIT © [pilmee](https://github.com/ElJijuna)
