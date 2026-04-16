import { useQuery } from '@tanstack/react-query'
import { searchProjects } from '../api/client'

export interface ProjectSearchFilters {
  businessUnitId?: string
  customerId?: string
  externalCustomerId?: string
  externalProjectId?: string
  externalReferenceId?: string
  name?: string
  addressLine?: string
  city?: string
  fromDate?: string
  toDate?: string
  skip?: number
  take?: number
}

export function useProjectSearch(filters: ProjectSearchFilters, enabled = true) {
  const query: Record<string, unknown> = {}
  if (filters.businessUnitId) query.businessUnitId = filters.businessUnitId
  if (filters.customerId) query.customerId = filters.customerId
  if (filters.externalCustomerId) query.externalCustomerId = filters.externalCustomerId
  if (filters.externalProjectId) query.externalProjectId = filters.externalProjectId
  if (filters.externalReferenceId) query.externalReferenceId = filters.externalReferenceId
  if (filters.name) query.name = filters.name
  if (filters.addressLine) query.addressLine = filters.addressLine
  if (filters.city) query.city = filters.city
  if (filters.fromDate) query.fromDate = filters.fromDate
  if (filters.toDate) query.toDate = filters.toDate
  if (filters.skip !== undefined) query.skip = filters.skip
  if (filters.take !== undefined) query.take = filters.take

  return useQuery({
    queryKey: ['projects', 'search', query],
    queryFn: async () => {
      const res = await searchProjects({
        query: query as Parameters<typeof searchProjects>[0] extends undefined
          ? never
          : NonNullable<NonNullable<Parameters<typeof searchProjects>[0]>['query']>,
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled,
  })
}
