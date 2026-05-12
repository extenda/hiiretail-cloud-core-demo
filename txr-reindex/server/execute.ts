import { google } from 'googleapis'

const PROJECT_ID = 'cloud-core-prod-2d76'
const REGION = 'europe-west1'
const JOB_NAME = 'txr-transaction-elastic-reindexer'

export interface ExecutionResult {
  executionName: string
}

export async function triggerExecution(
  backingIndexId: string,
  tenantId?: string,
  jobId?: string,
  jobType?: string,
  dateRange?: string,
): Promise<ExecutionResult> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  const run = google.run({ version: 'v2', auth })

  const env: Array<{ name: string; value: string }> = [
    { name: 'BACKING_INDEX_ID', value: backingIndexId },
  ]

  if (tenantId) {
    env.push({ name: 'TENANT_ID', value: tenantId })
  }

  if (jobId) {
    env.push({ name: 'JOB_ID', value: jobId })
  }

  if (jobType) {
    env.push({ name: 'JOB_TYPE', value: jobType })
  }

  if (dateRange) {
    env.push({ name: 'DATE_RANGE', value: dateRange })
  }

  const response = await run.projects.locations.jobs.run({
    name: `projects/${PROJECT_ID}/locations/${REGION}/jobs/${JOB_NAME}`,
    requestBody: {
      overrides: {
        containerOverrides: [{ env }],
      },
    },
  })

  const executionName = (response.data as Record<string, unknown>)?.['name'] as string | undefined
  return { executionName: executionName ?? '' }
}
