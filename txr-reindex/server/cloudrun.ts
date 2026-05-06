import { google } from 'googleapis'
import type { CloudRunExecution, ContainerInfo, EnvEntry } from '../src/api/types.js'

const PROJECT_ID = 'cloud-core-prod-2d76'
const REGION = 'europe-west1'
const JOB_NAME = 'txr-transaction-elastic-reindexer'

const PARENT = `projects/${PROJECT_ID}/locations/${REGION}/jobs/${JOB_NAME}`

const GCP_CONSOLE_BASE = 'https://console.cloud.google.com/run/jobs/executions/details'

function consoleUrl(executionName: string): string {
  return `${GCP_CONSOLE_BASE}/${REGION}/${executionName}?project=${PROJECT_ID}`
}

function extractEnvVarFromRaw(
  raw: Record<string, unknown>,
  name: string,
): string | undefined {
  try {
    const tmpl = raw['template'] as Record<string, unknown> | undefined
    const containers = tmpl?.['containers'] as Array<Record<string, unknown>> | undefined
    const env = containers?.[0]?.['env'] as Array<{ name: string; value?: string }> | undefined
    return env?.find((e) => e.name === name)?.value
  } catch {
    return undefined
  }
}

function buildContainerInfo(raw: Record<string, unknown>): ContainerInfo | undefined {
  try {
    const tmpl = raw['template'] as Record<string, unknown> | undefined
    const containers = tmpl?.['containers'] as Array<Record<string, unknown>> | undefined
    const c = containers?.[0]

    if (!c) return undefined

    const rawEnv = c['env'] as Array<{ name: string; value?: string; valueSource?: unknown }> | undefined
    const env: EnvEntry[] = (rawEnv ?? []).map((e) => ({
      name: e.name,
      // valueSource present (secret ref) → value is undefined; expose as null
      value: e.value ?? null,
    }))

    const limits = (c['resources'] as Record<string, unknown> | undefined)?.['limits'] as
      | Record<string, string>
      | undefined

    return {
      image: String(c['image'] ?? ''),
      env,
      cpu: limits?.['cpu'] ?? null,
      memory: limits?.['memory'] ?? null,
      taskCount: raw['taskCount'] != null ? Number(raw['taskCount']) : null,
      maxRetries: tmpl?.['maxRetries'] != null ? Number(tmpl['maxRetries']) : null,
      timeout: tmpl?.['timeout'] != null ? String(tmpl['timeout']) : null,
    }
  } catch {
    return undefined
  }
}

export async function fetchExecutions(): Promise<CloudRunExecution[]> {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  const run = google.run({ version: 'v2', auth })

  const response = await run.projects.locations.jobs.executions.list({
    parent: PARENT,
    pageSize: 50,
  })

  const items = response.data.executions ?? []

  return items.map((ex): CloudRunExecution => {
    const raw = ex as Record<string, unknown>
    const shortName = (ex.name ?? '').split('/').pop() ?? ''
    const conditions = (ex.conditions ?? []) as Array<{ type?: string; state?: string }>
    const readyCondition = conditions.find((c) => c.type === 'Ready')

    let status: CloudRunExecution['status'] = 'RUNNING'
    if (ex.completionTime) {
      if ((ex.failedCount ?? 0) > 0) status = 'FAILED'
      else if ((ex.cancelledCount ?? 0) > 0) status = 'CANCELLED'
      else status = 'SUCCEEDED'
    } else if (readyCondition?.state === 'CONDITION_FAILED') {
      status = 'FAILED'
    }

    const container = buildContainerInfo(raw)

    return {
      name: shortName,
      uid: ex.uid ?? '',
      status,
      createTime: ex.createTime ?? '',
      startTime: ex.startTime ?? '',
      completionTime: ex.completionTime ?? undefined,
      backingIndexId: extractEnvVarFromRaw(raw, 'BACKING_INDEX_ID'),
      consoleUrl: consoleUrl(shortName),
      container,
    }
  })
}
