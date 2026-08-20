import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { deleteProduct } from './api'

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Product deleted')
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to delete product.')
    },
  })
}
