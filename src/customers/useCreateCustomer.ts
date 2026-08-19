import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { createCustomer } from './api'

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      message.success(`Customer "${customer.first_name} ${customer.last_name}" created`)
    },
    onError: (err) => {
      message.error(
        err instanceof ApiError ? err.message : 'Failed to create customer.',
      )
    },
  })
}
