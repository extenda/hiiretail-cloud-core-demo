import { useQuery } from '@tanstack/react-query'
import { listSurveys } from '../api/client'
import type { SurveyStatus, UserType, Product } from '../api/client'

export interface SurveySearchFilters {
  status?: SurveyStatus | ''
  userType?: UserType | ''
  product?: Product | ''
  businessUnitId?: string
  targetPath?: string
  skip?: number
  take?: number
}

export function useSurveySearch(filters: SurveySearchFilters, enabled = true) {
  const query: NonNullable<Parameters<typeof listSurveys>[0]>['query'] = {}
  if (filters.status) query.status = filters.status
  if (filters.userType) query.userType = filters.userType
  if (filters.product) query.product = filters.product
  if (filters.businessUnitId) query.businessUnitId = filters.businessUnitId
  if (filters.targetPath) query.targetPath = filters.targetPath
  if (filters.skip !== undefined) query.skip = filters.skip
  if (filters.take !== undefined) query.take = filters.take

  return useQuery({
    queryKey: ['surveys', 'search', query],
    queryFn: async () => {
      const res = await listSurveys({ query })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled,
  })
}
