import { useQuery } from '@tanstack/react-query'
import { fetchCustomer } from './api'

export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomer(id as number),
    enabled: id !== null,
  })
}
