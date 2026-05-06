import type { ApiResponse, LogEntry } from './types'

export async function fetchMonitorData(): Promise<ApiResponse> {
  const res = await fetch('/api/data')
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<ApiResponse>
}

export async function fetchLogs(executionName: string): Promise<LogEntry[]> {
  const res = await fetch(`/api/logs?execution=${encodeURIComponent(executionName)}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<LogEntry[]>
}

export async function triggerExecution(
  backingIndexId: string,
  tenantId?: string,
  jobId?: string,
): Promise<{ executionName: string }> {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backingIndexId, tenantId, jobId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<{ executionName: string }>
}
