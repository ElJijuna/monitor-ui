import type { Monitor, WebVitalMetric } from 'monitor-api'
import { useWebVitals } from 'monitor-api/react'
import { Text } from '@gnome-ui/react'
import { VITAL_ORDER } from './formatters'
import { VitalTile } from './VitalTile'

interface WebVitalsSectionProps {
  monitor: Monitor
}

export function WebVitalsSection({ monitor }: WebVitalsSectionProps) {
  const webVitals = useWebVitals(monitor)

  return (
    <section className="monitor-inspector__section">
      <Text className="monitor-inspector__section-title" color="dim" variant="caption-heading">
        Web Vitals
      </Text>
      <div className="monitor-inspector__vitals" role="list">
        {VITAL_ORDER.map((name) => {
          const metric = webVitals[name.toLowerCase() as keyof typeof webVitals] as WebVitalMetric | null
          return <VitalTile key={name} metric={metric} name={name} />
        })}
      </div>
    </section>
  )
}
