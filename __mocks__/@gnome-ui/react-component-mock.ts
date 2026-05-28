import React from 'react'

interface PassProps {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

const PassThrough = ({ children, className, ...rest }: PassProps) =>
  React.createElement('div', { className, ...rest }, children)

export default PassThrough
export const Card = PassThrough
export const Drawer = PassThrough
export const Button = PassThrough
export const Badge = PassThrough
