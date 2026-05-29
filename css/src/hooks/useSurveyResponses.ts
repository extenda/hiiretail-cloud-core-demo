import { useQuery } from '@tanstack/react-query'
import { listResponses } from '../api/client'
import type { ResponseStatus } from '../api/client'

export interface ResponseSearchFilters {
  status?: ResponseStatus | ''
  businessUnitId?: string
  skip?: number
  take?: number
}

export function useSurveyResponses(
  surveyId: string | undefined,
  filters: ResponseSearchFilters,
) {
  return useQuery({
    queryKey: ['responses', surveyId, filters],
    queryFn: async () => {
      const res = await listResponses({
        path: { surveyId: surveyId! },
        query: {
          status: filters.status || undefined,
          businessUnitId: filters.businessUnitId || undefined,
          skip: filters.skip,
          take: filters.take,
        },
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled: !!surveyId,
  })
}
