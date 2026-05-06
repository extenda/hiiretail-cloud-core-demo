import { google } from 'googleapis'
import type { LogEntry } from '../src/api/types.js'

const PROJECT_ID = 'cloud-core-prod-2d76'
const JOB_NAME = 'txr-transaction-elastic-reindexer'

const ANSI_RE = /\x1b\[[0-9;]*[mGKHFJA-Z]/g

type LogLevel = LogEntry['level']

function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, '')
}

function extractLevel(text: string): LogLevel {
  // NestJS embeds the level as a token surrounded by spaces, e.g. "  DEBUG" or "  WARN"
  if (/\bERROR\b/.test(text)) return 'ERROR'
  if (/\bWARN\b/.test(text)) return 'WARN'
  if (/\bDEBUG\b/.test(text)) return 'DEBUG'
  if (/\bLOG\b/.test(text)) return 'LOG'
  return 'UNKNOWN'
}

export async function fetchLogs(executionName: string): Promise<LogEntry[]> {
  if (!executionName) return []

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/logging.read'],
  })

  const logging = google.logging({ version: 'v2', auth })

  const filter = [
    `resource.type="cloud_run_job"`,
    `resource.labels.job_name="${JOB_NAME}"`,
    `labels."run.googleapis.com/execution_name"="${executionName}"`,
  ].join(' AND ')

  const response = await logging.entries.list({
    requestBody: {
      resourceNames: [`projects/${PROJECT_ID}`],
      filter,
      orderBy: 'timestamp desc',
      pageSize: 500,
    },
  })

  const entries = response.data.entries ?? []

  return entries
    .filter((e) => e.textPayload)
    .map((e): LogEntry => {
      const text = stripAnsi(e.textPayload ?? '')
      return {
        timestamp: e.timestamp ?? '',
        text,
        level: extractLevel(text),
      }
    })
    .reverse()
}
