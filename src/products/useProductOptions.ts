import { useQuery } from '@tanstack/react-query'
import { fetchProductOptions } from './api'

export function useProductOptions() {
  return useQuery({
    queryKey: ['products', 'options'],
    queryFn: fetchProductOptions,
  })
}
