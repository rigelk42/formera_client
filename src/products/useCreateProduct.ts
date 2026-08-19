import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { createProduct } from './api'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success(`Product "${product.name}" created`)
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to create product.')
    },
  })
}
