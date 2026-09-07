/**
 * Returns history data for a sparkline chart.
 * A single real sample is repeated because the chart needs two points.
 * Empty histories stay empty so callers can render an honest empty state.
 */
export function toChartData(history: number[], fallback: number): number[] {
  if (history.length === 0) {
    return [];
  }

  return history.length === 1 ? [history[0] ?? fallback, history[0] ?? fallback] : history;
}
