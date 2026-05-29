/**
 * Returns history data for a sparkline chart.
 * When history has fewer than 2 points the chart needs at least 2 values,
 * so we fall back to [fallback, fallback] to keep the chart renderable.
 */
export function toChartData(history: number[], fallback: number): number[] {
  return history.length > 1 ? history : [fallback, fallback]
}
