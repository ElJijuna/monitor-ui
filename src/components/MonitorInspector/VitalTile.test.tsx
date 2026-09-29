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
    navigationId: 1,
    navigationURL: null,
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

  it('splits the value into attribution phases', () => {
    const { container } = render(
      <VitalTile
        name="LCP"
        metric={makeMetric({
          value: 1800,
          attribution: {
            target: 'main > img.hero',
            url: null,
            timeToFirstByte: 300,
            resourceLoadDelay: 0,
            resourceLoadDuration: 600,
            elementRenderDelay: 900,
          },
        })}
      />,
    );
    const tile = container.firstChild as HTMLElement;
    const phases = container.querySelectorAll<HTMLElement>('.monitor-inspector__vital-phase');

    // Empty phases are skipped; the rest grow with their share of the value.
    expect(phases).toHaveLength(3);
    expect(phases[2]?.style.flexGrow).toBe('0.5');
    expect(tile).toHaveAccessibleName(
      'Largest Contentful Paint: 1.8s. main > img.hero. Time to first byte 300ms. Resource load 600ms. Render delay 900ms',
    );
    expect(tile.title).toContain('main > img.hero');
  });

  it('omits the phase bar without attribution', () => {
    const { container } = render(<VitalTile name="LCP" metric={makeMetric()} />);

    expect(container.querySelector('.monitor-inspector__vital-phases')).toBeNull();
  });
});
