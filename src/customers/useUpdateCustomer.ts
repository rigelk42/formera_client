import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomer } from './api'
import type { UpdateCustomerInput } from './api'

// No toast/message here, same as useUpdateOrder.ts -- CustomerEditModal
// owns its own success/error handling (inline Alert on failure, message on
// success), consistent with how CustomerFormModal handles customer
// creation.
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      customerId,
      input,
    }: {
      customerId: number
      input: UpdateCustomerInput
    }) => updateCustomer(customerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}
