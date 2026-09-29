import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricAction } from './MetricAction';
import { MetricCard } from './MetricCard';
import { MetricList } from './MetricList';
import { MetricSpark } from './MetricSpark';

describe('MetricSpark', () => {
  it('renders nothing with fewer than two samples', () => {
    const { container } = render(<MetricSpark color="red" data={[42]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a line chart by default', () => {
    render(<MetricSpark color="red" data={[1, 2]} />);
    expect(screen.getByTestId('chart-mock')).toHaveClass('monitor-metric__spark');
  });

  it('renders a bar chart variant', () => {
    render(<MetricSpark color="red" data={[1, 2, 3]} variant="bar" />);
    expect(screen.getByTestId('chart-mock')).toHaveClass('monitor-metric__spark');
  });
});

describe('MetricList', () => {
  it('renders the title and the empty text', () => {
    render(<MetricList emptyText="Nothing here" items={[]} title="Recent" />);
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('uses a default empty text', () => {
    render(<MetricList items={[]} title="Recent" />);
    expect(screen.getByText('No records yet')).toBeInTheDocument();
  });

  it('renders every slot of an item', () => {
    render(
      <MetricList
        items={[
          {
            id: 'a',
            leading: 200,
            primary: '/api',
            secondary: 'GET',
            trailing: '12ms',
            tone: 'good',
          },
        ]}
        title="Requests"
      />,
    );
    const item = screen.getByRole('listitem');

    expect(item).toHaveAttribute('data-tone', 'good');
    expect(item).toHaveTextContent('200');
    expect(item).toHaveTextContent('/api');
    expect(item).toHaveTextContent('GET');
    expect(item).toHaveTextContent('12ms');
  });

  it('omits optional slots', () => {
    const { container } = render(<MetricList items={[{ id: 'a', primary: 'only' }]} title="T" />);

    expect(container.querySelector('.monitor-metric__list-leading')).toBeNull();
    expect(container.querySelector('.monitor-metric__list-secondary')).toBeNull();
    expect(container.querySelector('.monitor-metric__list-trailing')).toBeNull();
    expect(container.querySelector('.monitor-metric__list-bar')).toBeNull();
  });

  it.each([
    [0.5, '50%'],
    [1.7, '100%'],
    [-0.3, '0%'],
  ])('clamps a ratio of %p to a %p bar', (ratio, width) => {
    const { container } = render(
      <MetricList items={[{ id: 'a', primary: 'x', ratio }]} title="T" />,
    );
    const bar = container.querySelector<HTMLElement>('.monitor-metric__list-bar');

    expect(bar?.style.inlineSize).toBe(width);
  });
});

describe('MetricAction', () => {
  it('calls onClick', async () => {
    const onClick = jest.fn();

    render(<MetricAction label="Clear" onClick={onClick} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards disabled', () => {
    render(<MetricAction disabled label="Clear" onClick={jest.fn()} />);
    expect(screen.getByText('Clear')).toBeDisabled();
  });
});

describe('MetricCard slots', () => {
  it('omits optional regions when not provided', () => {
    const { container } = render(<MetricCard label="X" value={1} />);

    for (const cls of ['caption', 'action', 'unit', 'chart', 'stats', 'details']) {
      expect(container.querySelector(`.monitor-metric__${cls}`)).toBeNull();
    }

    expect(container.querySelector('.monitor-metric__surface')).not.toHaveAttribute('data-details');
  });

  it('renders caption, unit, chart, action and stat tones', () => {
    const { container } = render(
      <MetricCard
        action={<button type="button">Act</button>}
        caption="smooth"
        chart={<span>chart</span>}
        label="X"
        stats={[
          { label: 'Bad', value: 1, tone: 'bad' },
          { label: 'Plain', value: 2 },
        ]}
        unit="fps"
        value={60}
      />,
    );

    expect(screen.getByText('smooth')).toBeInTheDocument();
    expect(screen.getByText('fps')).toBeInTheDocument();
    expect(screen.getByText('Act')).toBeInTheDocument();
    expect(container.querySelector('.monitor-metric__chart')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    const stats = container.querySelectorAll('.monitor-metric__stat');

    expect(stats[0]).toHaveAttribute('data-tone', 'bad');
    expect(stats[1]).not.toHaveAttribute('data-tone');
  });

  it('renders a zero caption', () => {
    render(<MetricCard caption={0} label="X" value={1} />);
    expect(screen.getByText('0')).toHaveClass('monitor-metric__caption');
  });

  it('merges custom className, style and DOM props', () => {
    render(
      <MetricCard
        accent="blue"
        className="custom"
        data-testid="card"
        label="X"
        style={{ margin: 4 }}
        value={1}
      />,
    );
    const root = screen.getByTestId('card');

    expect(root).toHaveClass('monitor-metric', 'custom');
    expect(root.style.margin).toBe('4px');
    expect(root.style.getPropertyValue('--monitor-metric-accent')).toBe('blue');
  });

  it('keeps the given style when no accent is set', () => {
    render(<MetricCard label="X" style={{ margin: 2 }} value={1} />);
    const root = screen.getByRole('group');

    expect(root.style.margin).toBe('2px');
    expect(root.style.getPropertyValue('--monitor-metric-accent')).toBe('');
  });

  it('lets consumers override the accessible name', () => {
    render(<MetricCard aria-label="Frame rate" label="FPS" value={1} />);
    expect(screen.getByRole('group', { name: 'Frame rate' })).toBeInTheDocument();
  });

});

describe('MetricCard activation', () => {
  it('renders no activation button by default', () => {
    render(<MetricCard label="FPS" value={60} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('group')).not.toHaveAttribute('data-interactive');
  });

  it('covers the card with a button named after the label, value and caption', async () => {
    const onActivate = jest.fn();

    render(
      <MetricCard caption="smooth" label="FPS" onActivate={onActivate} unit="fps" value={58} />,
    );
    const button = screen.getByRole('button', { name: 'FPS, 58 fps, smooth' });

    expect(screen.getByRole('group')).toHaveAttribute('data-interactive');
    await userEvent.click(button);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('skips non-text captions in the default name and accepts a custom one', () => {
    const { rerender } = render(
      <MetricCard caption={<b>x</b>} label="Memory" onActivate={jest.fn()} value="—" />,
    );

    expect(screen.getByRole('button', { name: 'Memory, —' })).toBeInTheDocument();

    rerender(
      <MetricCard activateLabel="Open monitor" label="Memory" onActivate={jest.fn()} value="—" />,
    );
    expect(screen.getByRole('button', { name: 'Open monitor' })).toBeInTheDocument();
  });

  it('keeps header actions separate from activation', async () => {
    const onActivate = jest.fn();
    const onClear = jest.fn();

    render(
      <MetricCard
        action={
          <button onClick={onClear} type="button">
            Clear
          </button>
        }
        label="Events"
        onActivate={onActivate}
        value={3}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
  });
});

