import type { MemoryInfo } from 'monitor-api'

export function formatMemory(memory: MemoryInfo | null): { value: string; unit: string } {
  if (!memory) return { value: 'n/a', unit: '' }
  return { value: String(Math.round(memory.used)), unit: 'MB' }
}
