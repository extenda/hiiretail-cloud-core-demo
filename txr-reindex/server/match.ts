import type { CloudRunExecution, JobProgress, MatchedJob } from '../src/api/types.js'

const TIEBREAKER_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Correlates Cloud Run executions to Spanner progress rows.
 *
 * Pass 1 — direct match (new rows):
 *   progress.executionId === execution.name
 *
 * Pass 2 — legacy fallback (rows where executionId is null):
 *   execution.backingIndexId === progress.backingIndex,
 *   tiebreaker: closest createTime ↔ startedAt within ±10 min.
 *
 * Unmatched rows from either side appear with the other field as null.
 */
export function matchJobs(
  executions: CloudRunExecution[],
  progress: JobProgress[],
): MatchedJob[] {
  const usedProgressIds = new Set<string>()
  const usedExecutionNames = new Set<string>()
  const matched: MatchedJob[] = []

  // Index executions by name for O(1) lookup in pass 1
  const executionByName = new Map<string, CloudRunExecution>()
  for (const ex of executions) {
    executionByName.set(ex.name, ex)
  }

  // ------------------------------------------------------------------
  // Pass 1: direct executionId → execution.name match
  // ------------------------------------------------------------------
  for (const p of progress) {
    if (!p.executionId) continue

    const ex = executionByName.get(p.executionId)
    if (!ex) continue

    usedProgressIds.add(p.jobId)
    usedExecutionNames.add(ex.name)
    matched.push({ execution: ex, progress: p })
  }

  // ------------------------------------------------------------------
  // Pass 2: legacy fallback for rows without executionId
  // ------------------------------------------------------------------
  const progressByIndex = new Map<string, JobProgress[]>()
  for (const p of progress) {
    if (p.executionId || usedProgressIds.has(p.jobId)) continue
    const list = progressByIndex.get(p.backingIndex) ?? []
    list.push(p)
    progressByIndex.set(p.backingIndex, list)
  }

  for (const ex of executions) {
    if (usedExecutionNames.has(ex.name)) continue
    if (!ex.backingIndexId) continue

    const candidates = (progressByIndex.get(ex.backingIndexId) ?? []).filter(
      (c) => !usedProgressIds.has(c.jobId),
    )

    if (candidates.length === 0) continue

    const exTime = new Date(ex.createTime).getTime()

    let best: JobProgress | null = null
    let bestDelta = Infinity

    for (const c of candidates) {
      const delta = Math.abs(new Date(c.startedAt).getTime() - exTime)
      if (delta < bestDelta && delta <= TIEBREAKER_WINDOW_MS) {
        bestDelta = delta
        best = c
      }
    }

    // If none falls within the window but there is exactly one candidate, use it
    if (!best && candidates.length === 1) {
      best = candidates[0]!
    }

    if (best) {
      usedProgressIds.add(best.jobId)
      usedExecutionNames.add(ex.name)
      matched.push({ execution: ex, progress: best })
    }
  }

  // ------------------------------------------------------------------
  // Collect unmatched entries
  // ------------------------------------------------------------------
  for (const ex of executions) {
    if (!usedExecutionNames.has(ex.name)) {
      matched.push({ execution: ex, progress: null })
    }
  }

  for (const p of progress) {
    if (!usedProgressIds.has(p.jobId)) {
      matched.push({ execution: null, progress: p })
    }
  }

  return matched
}
