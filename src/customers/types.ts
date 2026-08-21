import type { Order } from '../orders/types'

export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string
  created_at: string
  updated_at: string
}

export interface Address {
  id: number
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
  created_at: string
  updated_at: string
}

export interface CustomerDetail extends Customer {
  addresses: Address[]
  orders: Order[]
}
