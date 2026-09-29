import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

interface PassProps {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

const CardMock = ({ children, className, ...rest }: PassProps) =>
  createElement('div', { className, 'data-testid': 'stat-card', ...rest }, children);

// Node slots are not DOM attributes: render them as children, like the real StatCard.
const StatCardMock = ({
  backgroundChart,
  children,
  icon,
  label,
  unit,
  value,
  ...rest
}: PassProps & {
  backgroundChart?: ReactNode;
  icon?: ReactNode;
  label?: string;
  unit?: string;
  value?: number | string;
}) =>
  CardMock({
    ...rest,
    children: createElement(
      Fragment,
      null,
      backgroundChart,
      label !== undefined && createElement('span', null, label),
      icon,
      value !== undefined && createElement('span', null, value),
      unit && createElement('span', null, unit),
      children,
    ),
  });

export const StatCard = StatCardMock;
export const CounterCard = CardMock;
export const Stack = CardMock;
export const Grid = CardMock;
