import { useQuery } from '@tanstack/react-query'
import { getSurvey } from '../api/client'

export function useSurveyById(surveyId: string | null) {
  return useQuery({
    queryKey: ['surveys', 'detail', surveyId],
    queryFn: async () => {
      const res = await getSurvey({ path: { surveyId: surveyId! } })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled: !!surveyId,
  })
}
