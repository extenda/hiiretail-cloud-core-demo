import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Connect } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'gcp-api',
      configureServer(server) {
        server.middlewares.use(
          '/api/data',
          async (_req: Connect.IncomingMessage, res, next) => {
            try {
              const { fetchExecutions } = await import('./server/cloudrun.js')
              const { fetchProgress } = await import('./server/spanner.js')
              const { matchJobs } = await import('./server/match.js')

              const [executions, progress] = await Promise.all([
                fetchExecutions(),
                fetchProgress(),
              ])

              const matched = matchJobs(executions, progress)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ executions, progress, matched }))
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(JSON.stringify({ error: message }))
              next(err)
            }
          },
        )

        server.middlewares.use(
          '/api/logs',
          async (req: Connect.IncomingMessage, res, next) => {
            try {
              const url = new URL(req.url ?? '/', 'http://localhost')
              const executionName = url.searchParams.get('execution') ?? ''
              const { fetchLogs } = await import('./server/logs.js')
              const entries = await fetchLogs(executionName)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(entries))
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(JSON.stringify({ error: message }))
              next(err)
            }
          },
        )

        server.middlewares.use(
          '/api/execute',
          async (req: Connect.IncomingMessage, res, next) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }
            try {
              const body = await new Promise<string>((resolve, reject) => {
                let data = ''
                req.on('data', (chunk: Buffer) => { data += chunk.toString() })
                req.on('end', () => resolve(data))
                req.on('error', reject)
              })
              const { backingIndexId, tenantId, jobId } = JSON.parse(body) as {
                backingIndexId: string
                tenantId?: string
                jobId?: string
              }
              const { triggerExecution } = await import('./server/execute.js')
              const result = await triggerExecution(backingIndexId, tenantId, jobId)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err)
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(JSON.stringify({ error: message }))
              next(err)
            }
          },
        )
      },
    },
  ],
})
