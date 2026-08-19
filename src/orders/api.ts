import { apiFetch, apiFetchBlob } from '../lib/api'
import { cursorFromUrl } from '../lib/pagination'
import type { AddressInput } from '../customers/types'
import type { Carrier, Order } from './types'

// One Monday-Sunday calendar week's worth of orders, as returned by
// OrderWeekPagination on the backend -- grouping happens server-side so a
// week is never split across two pages.
export interface OrderWeekGroup {
  week_start: string
  orders: Order[]
}

interface OrderWeekResponse {
  next: string | null
  previous: string | null
  weeks: OrderWeekGroup[]
}

export interface OrdersPage {
  weeks: OrderWeekGroup[]
  nextCursor: string | null
  previousCursor: string | null
}

export async function fetchOrders(cursor: string | null): Promise<OrdersPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = await apiFetch<OrderWeekResponse>(`/api/orders/${query}`)
  return {
    weeks: page.weeks,
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
  discount?: number
  items: CreateOrderLineItemInput[]
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function fetchOrderInvoice(orderId: number) {
  return apiFetchBlob(`/api/orders/${orderId}/invoice/`)
}

export function fetchCarriers(): Promise<{ carriers: Carrier[] }> {
  return apiFetch<{ carriers: Carrier[] }>('/api/shipstation/carriers/')
}

export interface CreateShipmentInput {
  carrier_id: string
  carrier_name: string
  service_code: string
  weight_oz: number
  length: number
  width: number
  height: number
}

// These purchase a real, live ShipStation label/void a real one -- never
// call them without the user having just confirmed the specific action in
// the UI (see OrderDetailModal's confirm step).
export function createShipment(
  orderId: number,
  input: CreateShipmentInput,
): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/shipment/`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function refreshShipment(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/shipment/refresh/`, { method: 'POST' })
}

export function voidShipment(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/shipment/void/`, { method: 'POST' })
}
