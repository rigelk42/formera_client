import { apiFetch } from '../lib/api'
import { cursorFromUrl, type CursorPage } from '../lib/pagination'
import type { AddressInput } from '../lib/types'
import type { Customer, CustomerDetail } from './types'

export interface CustomersPage {
  results: Customer[]
  nextCursor: string | null
  previousCursor: string | null
}

export async function fetchCustomers(cursor: string | null): Promise<CustomersPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = await apiFetch<CursorPage<Customer>>(`/api/customers/${query}`)
  return {
    results: page.results,
    nextCursor: cursorFromUrl(page.next),
    previousCursor: cursorFromUrl(page.previous),
  }
}

export function fetchCustomer(id: number): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>(`/api/customers/${id}/`)
}

// For populating a customer picker (e.g. the order form) rather than the
// paginated table -- 100 is CustomerCursorPagination's max_page_size, the
// most this can fetch in one request without a dedicated search endpoint.
export async function fetchCustomerOptions(): Promise<Customer[]> {
  const page = await apiFetch<CursorPage<Customer>>('/api/customers/?page_size=100')
  return page.results
}

export interface CreateCustomerInput {
  first_name: string
  last_name: string
  email: string | null
  phone: string
  address?: AddressInput
}

// The backend re-serializes the created customer with the nested address
// included, since CreateCustomerInput's "address" field is write-only.
export function createCustomer(input: CreateCustomerInput): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>('/api/customers/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// Archives the customer server-side rather than deleting the row (see
// CustomerDetailView) -- their existing addresses/orders are untouched.
export function deleteCustomer(id: number): Promise<void> {
  return apiFetch<void>(`/api/customers/${id}/`, { method: 'DELETE' })
}

// Every field is optional -- send only what's changing. Addresses/orders
// aren't editable through this endpoint (see CustomerUpdateSerializer).
export interface UpdateCustomerInput {
  first_name?: string
  last_name?: string
  email?: string | null
  phone?: string
}

export function updateCustomer(
  id: number,
  input: UpdateCustomerInput,
): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>(`/api/customers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

// Archives one of a customer's addresses server-side (see
// AddressDetailView) rather than deleting the row.
export function deleteAddress(customerId: number, addressId: number): Promise<void> {
  return apiFetch<void>(`/api/customers/${customerId}/addresses/${addressId}/`, {
    method: 'DELETE',
  })
}
