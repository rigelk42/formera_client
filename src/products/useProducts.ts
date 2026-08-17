import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchProducts } from './api'

export function useProducts(cursor: string | null) {
  return useQuery({
    queryKey: ['products', cursor],
    queryFn: () => fetchProducts(cursor),
    placeholderData: keepPreviousData,
  })
}
