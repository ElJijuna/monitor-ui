import { render, screen } from '@testing-library/react';
import type { WebVitalMetric } from 'monitor-api';
import { VitalTile } from './VitalTile';

function makeMetric(overrides: Partial<WebVitalMetric> = {}): WebVitalMetric {
  return {
    name: 'LCP',
    value: 1800,
    delta: 1800,
    rating: 'good',
    id: 'lcp-1',
    navigationType: 'navigate',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('VitalTile', () => {
  it('renders the vital name', () => {
    render(<VitalTile name="LCP" metric={null} />);
    expect(screen.getByText('LCP')).toBeInTheDocument();
  });

  it('shows — when metric is null', () => {
    render(<VitalTile name="CLS" metric={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows formatted value when metric is present', () => {
    render(<VitalTile name="LCP" metric={makeMetric({ value: 1800 })} />);
    expect(screen.getByText('1.8s')).toBeInTheDocument();
  });

  it('renders good rating label', () => {
    render(<VitalTile name="LCP" metric={makeMetric({ rating: 'good' })} />);
    expect(screen.getByText('good')).toBeInTheDocument();
  });

  it('renders meh for needs-improvement rating', () => {
    render(<VitalTile name="LCP" metric={makeMetric({ rating: 'needs-improvement' })} />);
    expect(screen.getByText('meh')).toBeInTheDocument();
  });

  it('renders poor rating label', () => {
    render(<VitalTile name="LCP" metric={makeMetric({ rating: 'poor' })} />);
    expect(screen.getByText('poor')).toBeInTheDocument();
  });

  it('applies good CSS class', () => {
    const { container } = render(<VitalTile name="LCP" metric={makeMetric({ rating: 'good' })} />);

    expect(container.firstChild).toHaveClass('monitor-inspector__vital--good');
  });

  it('applies warn CSS class for needs-improvement', () => {
    const { container } = render(
      <VitalTile name="INP" metric={makeMetric({ rating: 'needs-improvement' })} />,
    );

    expect(container.firstChild).toHaveClass('monitor-inspector__vital--warn');
  });

  it('applies poor CSS class', () => {
    const { container } = render(<VitalTile name="CLS" metric={makeMetric({ rating: 'poor' })} />);

    expect(container.firstChild).toHaveClass('monitor-inspector__vital--poor');
  });

  it('applies pending CSS class when metric is null', () => {
    const { container } = render(<VitalTile name="TTFB" metric={null} />);

    expect(container.firstChild).toHaveClass('monitor-inspector__vital--pending');
  });
});
