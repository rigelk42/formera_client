import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchOrders } from './api'

export function useOrders(cursor: string | null) {
  return useQuery({
    queryKey: ['orders', cursor],
    queryFn: () => fetchOrders(cursor),
    placeholderData: keepPreviousData,
  })
}
