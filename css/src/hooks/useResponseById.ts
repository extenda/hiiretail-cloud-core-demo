import { useQuery } from '@tanstack/react-query'
import { getResponse } from '../api/client'

export function useResponseById(surveyId: string, responseId: string | null) {
  return useQuery({
    queryKey: ['responses', surveyId, 'detail', responseId],
    queryFn: async () => {
      const res = await getResponse({ path: { surveyId, responseId: responseId! } })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled: !!responseId,
  })
}
