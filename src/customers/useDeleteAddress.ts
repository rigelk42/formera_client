import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import { deleteAddress } from './api'

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      addressId,
    }: {
      customerId: number
      addressId: number
    }) => deleteAddress(customerId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      message.success('Address deleted')
    },
    onError: (err) => {
      message.error(err instanceof ApiError ? err.message : 'Failed to delete address.')
    },
  })
}
