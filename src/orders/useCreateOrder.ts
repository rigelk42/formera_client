import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder } from './api'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // A new order can create a customer (new_customer) and/or an
      // address, and always changes an existing customer's order
      // history, so refresh every customers query rather than trying to
      // target just the affected one.
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
