import { useQuery } from '@tanstack/react-query'
import { fetchBusinessUnits } from '../api/businessUnit'

export function useBusinessUnits(groups?: string[], enabled = true) {
  return useQuery({
    queryKey: ['bum', 'business-units', groups],
    queryFn: () => fetchBusinessUnits(groups),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
