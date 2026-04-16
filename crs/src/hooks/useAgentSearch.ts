import { useQuery } from '@tanstack/react-query'
import { searchAgents } from '../api/client'

export interface AgentSearchFilters {
  businessUnitId?: string
  customerId?: string
  externalCustomerId?: string
  externalAgentId?: string
  name?: string
  skip?: number
  take?: number
}

export function useAgentSearch(filters: AgentSearchFilters, enabled = true) {
  const query: Record<string, unknown> = {}
  if (filters.businessUnitId) query.businessUnitId = filters.businessUnitId
  if (filters.customerId) query.customerId = filters.customerId
  if (filters.externalCustomerId) query.externalCustomerId = filters.externalCustomerId
  if (filters.externalAgentId) query.externalAgentId = filters.externalAgentId
  if (filters.name) query.name = filters.name
  if (filters.skip !== undefined) query.skip = filters.skip
  if (filters.take !== undefined) query.take = filters.take

  return useQuery({
    queryKey: ['agents', 'search', query],
    queryFn: async () => {
      const res = await searchAgents({
        query: query as Parameters<typeof searchAgents>[0] extends undefined
          ? never
          : NonNullable<NonNullable<Parameters<typeof searchAgents>[0]>['query']>,
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled,
  })
}
