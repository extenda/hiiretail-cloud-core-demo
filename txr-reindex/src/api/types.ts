export type CRJStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'
export type SpannerStatus = 'running' | 'completed' | 'failed'

export interface EnvEntry {
  name: string
  /** null when the value is sourced from a Secret Manager ref (not exposed by the API) */
  value: string | null
}

export interface ContainerInfo {
  image: string
  env: EnvEntry[]
  cpu: string | null
  memory: string | null
  taskCount: number | null
  maxRetries: number | null
  /** Raw timeout string from the API, e.g. "82800s" */
  timeout: string | null
}

export interface CloudRunExecution {
  name: string
  uid: string
  status: CRJStatus
  createTime: string
  startTime: string
  completionTime?: string
  /** Value of the BACKING_INDEX_ID env var override on this execution. */
  backingIndexId?: string
  consoleUrl: string
  container?: ContainerInfo
}

export interface JobProgress {
  jobId: string
  backingIndex: string
  /** Value of CLOUD_RUN_EXECUTION written by the job at startup. Null for rows created before this column was added. */
  executionId: string | null
  processedCount: number
  expectedCount: number | null
  status: SpannerStatus
  startedAt: string
  updatedAt: string
  error: string | null
}

export interface MatchedJob {
  execution: CloudRunExecution | null
  progress: JobProgress | null
}

export interface ApiResponse {
  executions: CloudRunExecution[]
  progress: JobProgress[]
  matched: MatchedJob[]
}

export interface ApiError {
  error: string
}

export interface LogEntry {
  /** ISO timestamp from Cloud Logging */
  timestamp: string
  /** ANSI-stripped textPayload */
  text: string
  level: 'DEBUG' | 'LOG' | 'WARN' | 'ERROR' | 'UNKNOWN'
}
