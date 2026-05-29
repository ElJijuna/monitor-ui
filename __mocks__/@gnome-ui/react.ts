import React from 'react'

type AnyProps = Record<string, unknown> & { children?: React.ReactNode; className?: string }

const PassThrough = ({ children, className, ...rest }: AnyProps) =>
  React.createElement('div', { className, ...rest }, children)

const ButtonMock = ({ children, className, onClick, type, ...rest }: AnyProps) =>
  React.createElement('button', { className, onClick, type, ...rest }, children)

const HeaderBarMock = ({ title, end, children, className, ...rest }: AnyProps & { title?: React.ReactNode; end?: React.ReactNode }) =>
  React.createElement('div', { className, ...rest }, title, end, children)

export default PassThrough
export const ThemeProvider = PassThrough
export const ActionRow = PassThrough
export const BoxedList = PassThrough
export const Button = ButtonMock
export const Card = PassThrough
export const Drawer = PassThrough
export const HeaderBar = HeaderBarMock
export const Text = PassThrough
