import { useQuery } from '@tanstack/react-query'
import { searchCustomers } from '../api/client'
import type { CustomerStatus } from '../api/client'

export interface CustomerSearchFilters {
  businessUnitId?: string
  externalCustomerId?: string
  status?: CustomerStatus | ''
  name?: string
  phone?: string
  address?: string
  skip?: number
  take?: number
}

export function useCustomerSearch(filters: CustomerSearchFilters, enabled = true) {
  const query: Record<string, unknown> = {}
  if (filters.businessUnitId) query.businessUnitId = filters.businessUnitId
  if (filters.externalCustomerId) query.externalCustomerId = filters.externalCustomerId
  if (filters.status) query.status = filters.status
  if (filters.name) query.name = filters.name
  if (filters.phone) query.phone = filters.phone
  if (filters.address) query.address = filters.address
  if (filters.skip !== undefined) query.skip = filters.skip
  if (filters.take !== undefined) query.take = filters.take

  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: async () => {
      const res = await searchCustomers({
        query: query as Parameters<typeof searchCustomers>[0] extends undefined
          ? never
          : NonNullable<NonNullable<Parameters<typeof searchCustomers>[0]>['query']>,
      })
      if (res.error) throw new Error(JSON.stringify(res.error))
      return res.data!
    },
    enabled,
  })
}
