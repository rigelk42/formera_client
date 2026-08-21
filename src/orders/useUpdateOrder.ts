import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOrder } from './api'
import type { UpdateOrderInput } from './api'

// No toast/message here, same as useShipment.ts's hooks -- OrderEditModal
// owns its own success/error handling (inline Alert on failure, message on
// success), consistent with how OrderFormModal handles order creation.
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: number; input: UpdateOrderInput }) =>
      updateOrder(orderId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
