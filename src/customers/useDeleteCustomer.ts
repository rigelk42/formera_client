import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { deleteCustomer } from './api'

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      message.success('Customer deleted')
    },
    onError: (err) => {
      message.error(
        err instanceof ApiError ? err.message : 'Failed to delete customer.',
      )
    },
  })
}
