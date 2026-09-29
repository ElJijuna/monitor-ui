import type { ReactNode } from 'react';
import { createElement } from 'react';

type AnyProps = Record<string, unknown> & { children?: ReactNode; className?: string };

const PassThrough = ({ children, className, ...rest }: AnyProps) =>
  createElement('div', { className, ...rest }, children);

// The component under test never submits forms, so the mock always renders a plain button.
const ButtonMock = ({ children, className, onClick, type: _type, ...rest }: AnyProps) =>
  createElement('button', { ...rest, className, onClick, type: 'button' }, children);

const HeaderBarMock = ({
  title,
  end,
  children,
  className,
  ...rest
}: AnyProps & { title?: ReactNode; end?: ReactNode }) =>
  createElement('div', { className, ...rest }, title, end, children);

// Row slots are nodes, not DOM attributes: render them as children, like the real ActionRow.
const ActionRowMock = ({
  title,
  subtitle,
  trailing,
  variant: _variant,
  children,
  className,
  ...rest
}: AnyProps & { title?: ReactNode; subtitle?: ReactNode; trailing?: ReactNode }) =>
  createElement(
    'div',
    { className, ...rest },
    title !== undefined && createElement('span', null, title),
    subtitle !== undefined && createElement('span', null, subtitle),
    trailing,
    children,
  );

export default PassThrough;
export const ThemeProvider = PassThrough;
export const ActionRow = ActionRowMock;
export const BoxedList = PassThrough;
export const Button = ButtonMock;
// `interactive` is a boolean behaviour flag, not a DOM attribute.
const CardMock = ({ interactive: _interactive, ...rest }: AnyProps) => PassThrough(rest);

export const Card = CardMock;
export const Drawer = PassThrough;
export const HeaderBar = HeaderBarMock;
export const Text = PassThrough;
