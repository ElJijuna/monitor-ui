import type { MemoryInfo } from 'monitor-api'

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  return `${Math.round(bytes / 1024)} KB`
}

export function formatMemory(memory: MemoryInfo | null): { value: string; unit: string } {
  if (!memory) return { value: 'n/a', unit: '' }
  return { value: String(Math.round(memory.used)), unit: 'MB' }
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
