import { useQuery } from '@tanstack/react-query'
import { fetchCarriers } from './api'

export function useCarriers(enabled: boolean) {
  return useQuery({
    queryKey: ['shipstation', 'carriers'],
    queryFn: fetchCarriers,
    enabled,
  })
}
