import { Spanner } from '@google-cloud/spanner'
import type { JobProgress } from '../src/api/types.js'

const PROJECT_ID = 'cloud-core-prod-2d76'
const INSTANCE_ID = 'exe-event-journal'
const DATABASE_ID = 'txr'

const TABLE = 'reindex_job_progress'

const COLUMNS = [
  'job_id',
  'backing_index',
  'execution_id',
  'processed_count',
  'expected_document_count',
  'status',
  'started_at',
  'updated_at',
  'error',
] as const

export async function fetchProgress(): Promise<JobProgress[]> {
  const spanner = new Spanner({ projectId: PROJECT_ID })
  const instance = spanner.instance(INSTANCE_ID)
  const database = instance.database(DATABASE_ID)

  try {
    const [rows] = await database.run({
      sql: `SELECT ${COLUMNS.join(', ')} FROM ${TABLE} ORDER BY started_at DESC LIMIT 100`,
    })

    return rows.map((row): JobProgress => {
      const data = row.toJSON() as Record<string, unknown>
      return {
        jobId: String(data['job_id'] ?? ''),
        backingIndex: String(data['backing_index'] ?? ''),
        executionId: data['execution_id'] != null ? String(data['execution_id']) : null,
        processedCount: Number(data['processed_count'] ?? 0),
        expectedCount: data['expected_document_count'] != null ? Number(data['expected_document_count']) : null,
        status: (data['status'] as JobProgress['status']) ?? 'running',
        startedAt: String(data['started_at'] ?? ''),
        updatedAt: String(data['updated_at'] ?? ''),
        error: data['error'] != null ? String(data['error']) : null,
      }
    })
  } finally {
    await database.close()
    spanner.close()
  }
}
