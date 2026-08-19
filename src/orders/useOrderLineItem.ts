import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOrderLineItemPrice } from './api'

export function useUpdateOrderLineItemPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      unitPrice,
    }: {
      orderId: number
      itemId: number
      unitPrice: number
    }) => updateOrderLineItemPrice(orderId, itemId, unitPrice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
