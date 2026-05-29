import type { ReactNode } from 'react'
import type { Monitor, WebVitalMetric, WebVitalName } from 'monitor-api'
import { useEvents, useNetwork, usePerformance, useReact, useWebVitals } from 'monitor-api/react'
import {
  ActionRow,
  BoxedList,
  Button,
  Drawer,
  HeaderBar,
  Text,
} from '@gnome-ui/react'
import type { DrawerProps } from '@gnome-ui/react'
import { StatCard } from '@gnome-ui/layout'
import { SparkLineChart } from '@gnome-ui/charts'
import { fpsColor } from '../../utils/fpsColor'
import '../../styles/tokens.css'
import './MonitorInspector.css'

export interface MonitorInspectorProps extends Omit<DrawerProps, 'children' | 'content'> {
  monitor: Monitor
  onOpenDashboard?: () => void
}

function formatMemory(memory: ReturnType<typeof usePerformance>['memory']): { value: string; unit: string } {
  if (!memory) return { value: 'n/a', unit: '' }
  return { value: String(Math.round(memory.used)), unit: 'MB' }
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  return `${Math.round(bytes / 1024)} KB`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const VITAL_ORDER: WebVitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']

const VITAL_FULL_NAMES: Record<WebVitalName, string> = {
  LCP: 'Largest Contentful Paint',
  INP: 'Interaction to Next Paint',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
}

function formatVital(name: WebVitalName, value: number): string {
  if (name === 'CLS') return value.toFixed(3)
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value)}ms`
}

function vitalRatingClass(rating: WebVitalMetric['rating']): string {
  if (rating === 'good') return 'monitor-inspector__vital--good'
  if (rating === 'needs-improvement') return 'monitor-inspector__vital--warn'
  return 'monitor-inspector__vital--poor'
}

function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <Text className="monitor-inspector__empty" color="dim" variant="caption">
      {children}
    </Text>
  )
}

export function MonitorInspector({
  monitor,
  open,
  onClose,
  onOpenDashboard,
  side = 'right',
  size = 'classic',
  title = 'Monitor',
  ...drawerProps
}: MonitorInspectorProps) {
  const performance = usePerformance(monitor)
  const network = useNetwork(monitor)
  const react = useReact(monitor)
  const events = useEvents(monitor)
  const webVitals = useWebVitals(monitor)
  const fpsChartColor = fpsColor(performance.fps)
  const memory = formatMemory(performance.memory)
  const latency = Math.round(network.window5s.avgLatency)
  const recentRequests = network.entries.slice(-5).reverse()
  const recentEvents = events.entries.slice(0, 6)
  const slowComponents = react.slowComponents.slice(0, 5)

  return (
    <Drawer
      {...drawerProps}
      className="monitor-inspector"
      onClose={onClose}
      open={open}
      side={side}
      size={size}
    >
      <HeaderBar
        end={(
          <>
            {onOpenDashboard ? (
              <Button onClick={onOpenDashboard} size="sm" variant="flat">
                Dashboard
              </Button>
            ) : null}
            <Button onClick={onClose} size="sm" variant="flat">
              Close
            </Button>
          </>
        )}
        title={title}
      />

      <div className="monitor-inspector__content">
        <section className="monitor-inspector__section">
          <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
            Performance
          </Text>
          <div className="monitor-inspector__stats">
            <StatCard
              backgroundChart={(
                <span className="monitor-inspector__spark" aria-hidden="true">
                  <SparkLineChart
                    color={fpsChartColor}
                    data={performance.fpsHistory.length > 1 ? performance.fpsHistory : [performance.fps, performance.fps]}
                    height={34}
                  />
                </span>
              )}
              label="FPS"
              unit="fps"
              value={Math.round(performance.fps)}
            />
            <StatCard
              backgroundChart={(
                <span className="monitor-inspector__spark" aria-hidden="true">
                  <SparkLineChart
                    color="var(--monitor-color-memory, var(--gnome-accent-color, #3584e4))"
                    data={performance.memoryHistory.length > 1 ? performance.memoryHistory : [0, performance.memory?.used ?? 0]}
                    height={34}
                  />
                </span>
              )}
              label="JS Heap"
              unit={memory.unit}
              value={memory.value}
            />
            <StatCard
              label="Requests"
              unit="/ 5s"
              value={network.window5s.count}
            />
            <StatCard
              label="Latency"
              unit={latency > 0 ? 'ms' : ''}
              value={latency > 0 ? latency : '-'}
            />
          </div>
        </section>

        <section className="monitor-inspector__section">
          <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
            Web Vitals
          </Text>
          <div className="monitor-inspector__vitals" role="list">
            {VITAL_ORDER.map((name) => {
              const metric = webVitals[name.toLowerCase() as keyof typeof webVitals] as WebVitalMetric | null
              return (
                <div
                  key={name}
                  aria-label={`${VITAL_FULL_NAMES[name]}: ${metric ? formatVital(name, metric.value) : 'pending'}`}
                  className={[
                    'monitor-inspector__vital',
                    metric ? vitalRatingClass(metric.rating) : 'monitor-inspector__vital--pending',
                  ].join(' ')}
                  role="listitem"
                  title={VITAL_FULL_NAMES[name]}
                >
                  <span className="monitor-inspector__vital-name">{name}</span>
                  <span className="monitor-inspector__vital-value monitor-inspector__value">
                    {metric ? formatVital(name, metric.value) : '—'}
                  </span>
                  {metric && (
                    <span className="monitor-inspector__vital-rating">
                      {metric.rating === 'needs-improvement' ? 'meh' : metric.rating}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="monitor-inspector__section">
          <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
            Recent Requests
          </Text>
          <BoxedList>
            {recentRequests.length > 0 ? recentRequests.map((entry) => (
              <ActionRow
                key={entry.id}
                subtitle={`${entry.method} - ${formatBytes(entry.payloadSize)} - ${Math.round(entry.latency)}ms`}
                title={entry.url}
                trailing={(
                  <Text
                    className="monitor-inspector__value"
                    color={entry.error || entry.status >= 400 ? 'error' : 'success'}
                    variant="numeric"
                  >
                    {entry.status || 'ERR'}
                  </Text>
                )}
              />
            )) : (
              <EmptyRow>No requests yet</EmptyRow>
            )}
          </BoxedList>
        </section>

        <section className="monitor-inspector__section">
          <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
            React
          </Text>
          <BoxedList>
            <ActionRow
              title="Commits"
              trailing={<Text className="monitor-inspector__value" variant="numeric">{react.totalCommits}</Text>}
              variant="property"
            />
            {slowComponents.length > 0 ? slowComponents.map((entry) => (
              <ActionRow
                key={`${entry.commitId}-${entry.component}-${entry.timestamp}`}
                subtitle={`${entry.type} - ${entry.duration.toFixed(1)}ms`}
                title={entry.component}
              />
            )) : (
              <EmptyRow>No slow components</EmptyRow>
            )}
          </BoxedList>
        </section>

        <section className="monitor-inspector__section">
          <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
            App Events
          </Text>
          <BoxedList>
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <ActionRow
                key={event.id}
                subtitle={formatTime(event.timestamp)}
                title={event.label}
              />
            )) : (
              <EmptyRow>No events</EmptyRow>
            )}
          </BoxedList>
        </section>
      </div>
    </Drawer>
  )
}
