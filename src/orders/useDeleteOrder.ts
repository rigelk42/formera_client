import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { deleteOrder } from './api'

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      // Deleting an order can change a customer's order history, same as
      // creating one -- see useCreateOrder.
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      message.success('Order deleted')
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to delete order.')
    },
  })
}
