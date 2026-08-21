import { apiFetch, apiFetchBlob } from '../lib/api'
import { cursorFromUrl } from '../lib/pagination'
import type { AddressInput } from '../lib/types'
import type { Carrier, Order, OrderStatus } from './types'

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

export interface NewProductInput {
  name: string
  price: number
}

// Exactly one of product/new_product must be set, mirroring
// CreateOrderInput's customer_id/new_customer split -- see
// OrderLineItemCreateSerializer.validate() on the backend.
export interface CreateOrderLineItemInput {
  product?: number
  new_product?: NewProductInput
  quantity: number
  // Omit to default to the product's current catalog price server-side.
  // For a new_product item, this is also that product's catalog price.
  unit_price?: number
}

export interface CreateOrderInput {
  customer_id?: number
  new_customer?: NewCustomerInput
  shipping_address?: AddressInput
  // Omit to default to "cash_pickup" server-side.
  status?: OrderStatus
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

// Archives the order server-side rather than deleting the row (see
// OrderDetailView).
export function deleteOrder(orderId: number): Promise<void> {
  return apiFetch<void>(`/api/orders/${orderId}/`, { method: 'DELETE' })
}

// Include "id" to edit an existing line item's quantity/unit_price, or
// omit it to add a new one -- exactly one of product/new_product is
// required in that case, mirroring CreateOrderLineItemInput. This is a
// full replace of the order's items: any existing item not included here
// gets removed -- see OrderUpdateSerializer._sync_items() on the backend.
export interface UpdateOrderLineItemInput {
  id?: number
  product?: number
  new_product?: NewProductInput
  quantity: number
  unit_price?: number
}

// Every field is optional -- send only what's changing. Locked server-side
// once the order has an active shipping label (see OrderDetailView.patch/
// OrderUpdateSerializer) -- void the shipment first to edit again.
export interface UpdateOrderInput {
  status?: OrderStatus
  // null explicitly clears an existing discount; omit to leave it as-is.
  discount?: number | null
  shipping_address?: AddressInput
  items?: UpdateOrderLineItemInput[]
}

export function updateOrder(orderId: number, input: UpdateOrderInput): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

// Overrides a single line item's price on an already-placed order,
// recomputing the order's total server-side -- see OrderLineItemUpdateView.
export function updateOrderLineItemPrice(
  orderId: number,
  itemId: number,
  unitPrice: number,
): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ unit_price: unitPrice }),
  })
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
