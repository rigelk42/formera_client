import type { AddressInput } from '../lib/types'

export type OrderStatus = 'paid' | 'cash_pickup' | 'venmo' | 'referral'

export type ShippingStatus =
  'not_shipped' | 'label_created' | 'in_transit' | 'delivered' | 'exception' | 'voided'

export interface OrderLineItem {
  id: number
  product: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: number
  order_number: string
  customer: number
  customer_name: string
  shipping_address: AddressInput | null
  status: OrderStatus
  // Whole-percent discount applied to the line item subtotal, 1-100.
  // null means no discount was applied.
  discount: number | null
  // DRF serializes DecimalField as a string to avoid float precision loss
  total_amount: string
  items: OrderLineItem[]
  created_at: string
  updated_at: string
  shipping_status: ShippingStatus
  carrier_code: string
  carrier_name: string
  service_code: string
  tracking_number: string
  label_url: string
  // DRF serializes DecimalField as a string; null until a label exists.
  shipping_cost: string | null
  shipped_at: string | null
}

// Best-effort shape for ShipStation's GET /v2/carriers response -- there's
// no sandbox to verify field names against a real response ahead of time,
// so double check these against the actual payload on first live use.
export interface CarrierService {
  service_code: string
  name: string
}

export interface Carrier {
  carrier_id: string
  friendly_name: string
  services: CarrierService[]
}
