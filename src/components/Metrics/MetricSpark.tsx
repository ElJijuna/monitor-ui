import { SparkBarChart, SparkLineChart } from '@gnome-ui/charts';

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
    <SparkBarChart className="monitor-metric__spark" color={color} data={data} highlighted />
  ) : (
    <SparkLineChart
      className="monitor-metric__spark"
      color={color}
      data={data}
      highlighted
      strokeWidth={1.5}
    />
  );
};
