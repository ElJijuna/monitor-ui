import { SparkAreaChart, SparkBarChart } from '@gnome-ui/charts';

/**
 * Tallest chart any layout uses. The chart only takes a px height, so it is rendered at the
 * maximum and clamped by `max-block-size` from the container query in Metrics.css.
 */
const MAX_CHART_HEIGHT = 64;

interface MetricSparkProps {
  data: number[];
  color: string;
  variant?: 'line' | 'bar';
}

/**
 * Sparkline sized by the widget's container query (`--monitor-metric-chart-size`).
 * Returns null until there are at least two samples so the card never draws a fake trend.
 */
export const MetricSpark = ({ data, color, variant = 'line' }: MetricSparkProps) => {
  if (data.length < 2) {
    return null;
  }

  return variant === 'bar' ? (
    <SparkBarChart
      className="monitor-metric__spark"
      color={color}
      data={data}
      height={MAX_CHART_HEIGHT}
      highlighted
    />
  ) : (
    <SparkAreaChart
      className="monitor-metric__spark"
      color={color}
      data={data}
      gradient={false}
      height={MAX_CHART_HEIGHT}
      highlighted
      strokeWidth={1.5}
    />
  );
};
