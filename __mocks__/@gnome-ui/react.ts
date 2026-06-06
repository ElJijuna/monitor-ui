import type { ReactNode } from 'react';
import React from 'react';

type AnyProps = Record<string, unknown> & { children?: ReactNode; className?: string };

const PassThrough = ({ children, className, ...rest }: AnyProps) =>
  React.createElement('div', { className, ...rest }, children);

const ButtonMock = ({ children, className, onClick, type = 'button', ...rest }: AnyProps) =>
  // biome-ignore lint/a11y/useButtonType: type is defaulted to 'button' in the destructuring above
  React.createElement('button', { className, onClick, type, ...rest }, children);

const HeaderBarMock = ({
  title,
  end,
  children,
  className,
  ...rest
}: AnyProps & { title?: ReactNode; end?: ReactNode }) =>
  React.createElement('div', { className, ...rest }, title, end, children);

export default PassThrough;
export const ThemeProvider = PassThrough;
export const ActionRow = PassThrough;
export const BoxedList = PassThrough;
export const Button = ButtonMock;
export const Card = PassThrough;
export const Drawer = PassThrough;
export const HeaderBar = HeaderBarMock;
export const Text = PassThrough;
