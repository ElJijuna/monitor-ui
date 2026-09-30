# monitor-ui

[![npm version](https://img.shields.io/npm/v/monitor-ui)](https://www.npmjs.com/package/monitor-ui)
[![npm downloads](https://img.shields.io/npm/dm/monitor-ui)](https://www.npmjs.com/package/monitor-ui)
[![license](https://img.shields.io/npm/l/monitor-ui)](./LICENSE)
[![CI](https://github.com/ElJijuna/monitor-ui/actions/workflows/release.yml/badge.svg)](https://github.com/ElJijuna/monitor-ui/actions/workflows/release.yml)

Three-level React UI for [monitor-api](https://www.npmjs.com/package/monitor-api): a compact pill that shows live metrics, an inspector panel with detailed sections, and a full dashboard of metric widgets and logs. Each level is independently usable or wired together into a drill-down flow.

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

A compact, clickable live metric — the `size="pill"` metric widget for `scope`. Click it to open the
inspector. An offline chip appears next to it while the browser reports no network.

```tsx
import { useEffect, useMemo, useState } from 'react'
import { createMonitor } from 'monitor-api'
import { MonitorPill, MonitorInspector } from 'monitor-ui'

export function App() {
  const monitor = useMemo(() => createMonitor({
    maxHistory: 120,
    collectors: ['performance', 'network', 'react', 'events', 'webVitals', 'errors', 'device'],
  }), [])
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

**`scope` values:** any metric — `"health"` (the most serious current problem) · `"fps"` · `"memory"` · `"network"` · `"events"` · `"errors"` ·
`"resources"` · `"webVitals"` · `"react"` · `"reporter"` · `"device"` — plus `"performance"` (default, same as `"fps"`).

### 2. MonitorInspector — detailed panel

A side panel with every metric widget — health, FPS, memory, Web Vitals, network, resources,
React, events, errors, reporter and device — plus device chips. Widgets are `expanded`: even in a
narrow panel each one shows its stats and drill-down list (long frames, requests, vitals
attribution, errors with their stack traces…) stacked under the card; in a panel of 600px or
more they switch to their side-by-side lg layout.

```tsx
<MonitorInspector monitor={monitor} />
```

Error and reporter actions are opt-in:

```tsx
<MonitorInspector
  monitor={monitor}
  allowClearErrors
  allowFlushReport
/>
```

### 3. Dashboard — full view

A full view built from the metric widgets — FPS, memory, network, resources, Web Vitals, events,
errors, reporter, React and device — plus network and event logs. Widgets fill an auto-fill grid; when the
dashboard is at least 640px wide, FPS, Network, Web Vitals and Errors take 2 × 2 cells and show
their drill-down panels. Rows have a fixed minimum height, so cards keep their size as data arrives. The header shows device chips: connectivity, a slow-connection or data-saver warning, browser and OS, CPU cores and RAM.
Enable the `resources` collector (and optionally Web Vitals `attribution`) to fill every widget.

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
  const monitor = useMemo(() => createMonitor({
    maxHistory: 120,
    collectors: ['performance', 'network', 'react', 'events', 'webVitals', 'errors'],
  }), [])
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

### Web Vitals diagnostics

Enable `attribution` in the Web Vitals collector to see *why* each vital has its value: the
Inspector splits each tile into its phases (hover for details), and the Web Vitals widget lists
the element behind each report with its slowest phase.

```ts
createMonitor({
  collectors: { webVitals: { attribution: true } },
})
```

It loads the larger `web-vitals/attribution` build on demand, and selectors and URLs can reveal
page structure — see monitor-api's `PRIVACY.md`. Without it, the UI shows values and ratings only.

### Device and browser information

The device collector (monitor-api 1.9+) describes where the page runs. `DeviceMetric`
(`scope="device"`) shows the browser and OS. It turns red while the browser is offline and
yellow or red when the browser estimates a slow connection (`3g`, `2g`). Its drill-down lists the
connection estimate (type, RTT, downlink, data saver), screen size and pixel ratio, viewport,
language, time zone, color scheme and motion preference. Values the browser does not expose (for
example `deviceMemory` and the connection estimate outside Chromium) are left out.

The same information feeds the other widgets: the Health **Connection** check grades the connection
estimate, and the Network caption adds the connection type (`idle · 4g`).

```tsx
<DeviceMetric monitor={monitor} size="lg" />
```

## API

### `MonitorPill`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance from `monitor-api` |
| `scope` | `MonitorMetricKind \| 'performance'` | `'performance'` | Which metric to display |
| `label` | `string` | `'Open monitor'` | Accessible name of the pill button |
| `onClick` | `() => void` | — | Called when the pill is activated |
| `...span` | `HTMLAttributes<HTMLSpanElement>` | — | Props for the wrapper element |

### `MonitorInspector`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance |
| `showErrors` | `boolean` | `true` | Show captured error diagnostics |
| `showReporter` | `boolean` | `true` | Show production reporter diagnostics |
| `allowClearErrors` | `boolean` | `false` | Allow clearing retained error records |
| `allowFlushReport` | `boolean` | `false` | Allow an immediate report while the reporter is idle |
| `...div` | `HTMLAttributes<HTMLDivElement>` except `title` | — | Native div props |

### `Dashboard`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `monitor` | `Monitor` | — | Monitor instance |
| `title` | `string` | `'Dashboard'` | Dashboard heading |
| `onBack` | `() => void` | — | Shows a Back button when provided |
| `showErrors` | `boolean` | `true` | Show captured error diagnostics |
| `showReporter` | `boolean` | `true` | Show production reporter diagnostics |
| `allowClearErrors` | `boolean` | `false` | Allow clearing retained error records |
| `allowFlushReport` | `boolean` | `false` | Allow an immediate report while the reporter is idle |

## Utility exports

```ts
import {
  fpsColor,       // (fps: number) => string — CSS color for FPS value
  latencyColor,   // (ms: number) => string — CSS color for latency value
  memoryColor,    // (ratio: number) => string — CSS color for memory ratio
  formatBytes,    // (bytes: number) => string — e.g. "42.1 MB"
  formatMemory,   // (bytes: number) => string — heap-aware formatting
  formatTime,     // (ms: number) => string — e.g. "1.2s" or "340ms"
  formatBrowser,  // (browser: BrowserInfo) => string | null — e.g. "Chrome 128"
  formatPlatform, // (browser: BrowserInfo) => string | null — e.g. "macOS · desktop"
  formatScreen,   // (screen: ScreenInfo) => string | null — e.g. "1512×982 @2x"
  formatSize,     // (size: { width, height }) => string | null — e.g. "1280×720"
  formatConnection, // (connection: ConnectionInfo) => string | null — e.g. "4g · 50ms · 10 Mb/s"
  connectionTone, // (connection: ConnectionInfo) => 'good' | 'warn' | 'bad' | null
  toChartData,    // (history: Sample[]) => ChartData
} from 'monitor-ui'
```

## License

MIT © [pilmee](https://github.com/ElJijuna)
