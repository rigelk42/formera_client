export type OrderStatus = 'paid' | 'cash_pickup' | 'referral'

export interface OrderLineItem {
  id: number
  product: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

export interface OrderShippingAddress {
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Order {
  id: number
  order_number: string
  customer: number
  customer_name: string
  shipping_address: OrderShippingAddress | null
  status: OrderStatus
  // Whole-percent discount applied to the line item subtotal, 1-100.
  // null means no discount was applied.
  discount: number | null
  // DRF serializes DecimalField as a string to avoid float precision loss
  total_amount: string
  items: OrderLineItem[]
  created_at: string
  updated_at: string
}
