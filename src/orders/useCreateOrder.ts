import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { createOrder } from './api'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      // A new order can create a customer (new_customer) and/or an
      // address, and always changes an existing customer's order
      // history, so refresh every customers query rather than trying to
      // target just the affected one.
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      message.success(`Order ${order.order_number} created for ${order.customer_name}`)
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to create order.')
    },
  })
}
