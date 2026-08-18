import { apiFetch } from '../lib/api'
import { cursorFromUrl, type CursorPage } from '../lib/pagination'
import type { AddressInput } from '../customers/types'
import type { Order } from './types'

export interface OrdersPage {
  results: Order[]
  nextCursor: string | null
  previousCursor: string | null
}

export async function fetchOrders(cursor: string | null): Promise<OrdersPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = await apiFetch<CursorPage<Order>>(`/api/orders/${query}`)
  return {
    results: page.results,
    nextCursor: cursorFromUrl(page.next),
    previousCursor: cursorFromUrl(page.previous),
  }
}

export interface NewCustomerInput {
  first_name: string
  last_name: string
  email: string | null
  phone: string
}

export interface CreateOrderLineItemInput {
  product: number
  quantity: number
}

export interface CreateOrderInput {
  customer_id?: number
  new_customer?: NewCustomerInput
  shipping_address?: AddressInput
  items: CreateOrderLineItemInput[]
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
