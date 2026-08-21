import type { OrderStatus } from './types'

// Shared between OrderFormModal (create) and OrderEditModal (edit) so the
// two pickers can't drift out of sync with each other or with the
// backend's Order.Status choices.
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'cash_pickup', label: 'Cash Pickup' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'referral', label: 'Referral' },
]
