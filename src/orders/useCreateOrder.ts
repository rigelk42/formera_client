import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { createOrder } from './api'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order, input) => {
      // A new order can create a customer (new_customer) and/or an
      // address, and always changes an existing customer's order
      // history, so refresh every customers query rather than trying to
      // target just the affected one.
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      // `input` is what was actually submitted, so it tells us whether a
      // customer/address were newly created as a side effect of this
      // order, not just placed against existing records.
      const extras = [
        input.new_customer && 'new customer',
        input.shipping_address && 'new address',
      ].filter(Boolean)
      const suffix = extras.length ? ` (${extras.join(', ')})` : ''
      message.success(
        `Order ${order.order_number} created for ${order.customer_name}${suffix}`,
      )
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to create order.')
    },
  })
}
