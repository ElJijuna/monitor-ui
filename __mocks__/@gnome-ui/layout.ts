import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

interface PassProps {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

const CardMock = ({ children, className, ...rest }: PassProps) =>
  createElement('div', { className, 'data-testid': 'stat-card', ...rest }, children);

// `backgroundChart` is a node slot, not a DOM attribute: render it as a child instead.
const StatCardMock = ({
  backgroundChart,
  children,
  ...rest
}: PassProps & { backgroundChart?: ReactNode }) =>
  CardMock({ ...rest, children: createElement(Fragment, null, backgroundChart, children) });

export const StatCard = StatCardMock;
export const CounterCard = CardMock;
export const Stack = CardMock;
export const Grid = CardMock;
