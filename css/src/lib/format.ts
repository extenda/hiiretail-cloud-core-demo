/** Format an ISO timestamp for display, e.g. "1 Jan 2026, 00:00". Returns undefined for empty input. */
export function formatDateTime(iso: string | undefined | null): string | undefined {
  if (!iso) return undefined
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso ?? undefined
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Convert an ISO timestamp to the value format expected by <input type="datetime-local"> in local time. */
export function isoToLocalInput(iso: string | undefined | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
