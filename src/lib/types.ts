// Shared across customers/ (a customer's saved address) and orders/ (an
// order's shipping address) -- both send/receive the identical shape, so
// it's defined once here instead of twice and drifting.
export interface AddressInput {
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}
