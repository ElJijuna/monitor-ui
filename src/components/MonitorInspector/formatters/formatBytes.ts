export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  return `${Math.round(bytes / 1024)} KB`
}
