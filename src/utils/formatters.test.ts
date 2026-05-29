import { formatBytes, formatMemory, formatTime } from './formatters'

describe('formatBytes', () => {
  it('returns 0 KB for 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 KB')
  })

  it('returns 0 KB for negative bytes', () => {
    expect(formatBytes(-100)).toBe('0 KB')
  })

  it('converts bytes to KB', () => {
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('rounds to nearest KB', () => {
    expect(formatBytes(1536)).toBe('2 KB')
  })
})

describe('formatMemory', () => {
  it('returns n/a for null memory', () => {
    expect(formatMemory(null)).toEqual({ value: 'n/a', unit: '' })
  })

  it('formats memory used in MB', () => {
    expect(formatMemory({ used: 42, total: 128, percent: 32.8 })).toEqual({ value: '42', unit: 'MB' })
  })

  it('rounds memory to nearest integer', () => {
    expect(formatMemory({ used: 42.7, total: 128, percent: 33.4 })).toEqual({ value: '43', unit: 'MB' })
  })
})

describe('formatTime', () => {
  it('returns a localized time string with hour, minute and second parts', () => {
    const timestamp = new Date('2024-01-15T14:30:45').getTime()
    const result = formatTime(timestamp)
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/)
  })

  it('returns a non-empty string for any timestamp', () => {
    expect(formatTime(Date.now())).toBeTruthy()
  })
})
