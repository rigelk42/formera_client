import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchCustomers } from './api'

export function useCustomers(cursor: string | null) {
  return useQuery({
    queryKey: ['customers', cursor],
    queryFn: () => fetchCustomers(cursor),
    placeholderData: keepPreviousData,
  })
}
