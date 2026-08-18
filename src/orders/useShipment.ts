import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createShipment, refreshShipment, voidShipment } from './api'
import type { CreateShipmentInput } from './api'

// One hook per action (rather than useCreateOrder.ts-style one file each)
// since these three are tightly coupled facets of the same shipment panel,
// unlike list vs. create which are separate concerns elsewhere in the app.

export function useCreateShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: number; input: CreateShipmentInput }) =>
      createShipment(orderId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useRefreshShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) => refreshShipment(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useVoidShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) => voidShipment(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
