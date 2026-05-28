import React from 'react'

interface PassProps {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

const CardMock = ({ children, className, ...rest }: PassProps) =>
  React.createElement('div', { className, 'data-testid': 'stat-card', ...rest }, children)

export const StatCard = CardMock
export const CounterCard = CardMock
export const Stack = CardMock
export const Grid = CardMock
