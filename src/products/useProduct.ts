import { useQuery } from '@tanstack/react-query'
import { fetchProduct } from './api'

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id as number),
    enabled: id !== null,
  })
}
