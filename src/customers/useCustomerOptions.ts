import { useQuery } from '@tanstack/react-query'
import { fetchCustomerOptions } from './api'

export function useCustomerOptions() {
  return useQuery({
    queryKey: ['customers', 'options'],
    queryFn: fetchCustomerOptions,
  })
}
