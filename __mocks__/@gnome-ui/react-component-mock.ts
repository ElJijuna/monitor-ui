import type { ReactNode } from 'react';
import { createElement } from 'react';

interface PassProps {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

const PassThrough = ({ children, className, ...rest }: PassProps) =>
  createElement('div', { className, ...rest }, children);

export default PassThrough;
export const ActionRow = PassThrough;
export const BoxedList = PassThrough;
export const HeaderBar = PassThrough;
export const Text = PassThrough;
export const Card = PassThrough;
export const Drawer = PassThrough;
export const Button = PassThrough;
export const Badge = PassThrough;
