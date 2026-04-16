import { useQuery } from '@tanstack/react-query'
import { getCustomerById } from '../api/client'

export function useCustomerById(customerId: string | null) {
  return useQuery({
    queryKey: ['customers', 'detail', customerId],
    queryFn: async () => {
      const res = await getCustomerById({
        path: { customerId: customerId! },
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled: !!customerId,
  })
}
