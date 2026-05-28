import React from 'react'

const PassThrough = ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement('div', { className, ...rest }, children)

export default PassThrough
export const ThemeProvider = PassThrough
export const ActionRow = PassThrough
export const BoxedList = PassThrough
export const Button = PassThrough
export const Card = PassThrough
export const Drawer = PassThrough
export const HeaderBar = PassThrough
export const Text = PassThrough
