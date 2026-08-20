import { apiFetch } from '../lib/api'
import { cursorFromUrl, type CursorPage } from '../lib/pagination'
import type { DosageInput, Product, ProductDetail } from './types'

export interface ProductsPage {
  results: Product[]
  nextCursor: string | null
  previousCursor: string | null
}

export async function fetchProducts(cursor: string | null): Promise<ProductsPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const page = await apiFetch<CursorPage<Product>>(`/api/products/${query}`)
  return {
    results: page.results,
    nextCursor: cursorFromUrl(page.next),
    previousCursor: cursorFromUrl(page.previous),
  }
}

export function fetchProduct(id: number): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/api/products/${id}/`)
}

// For populating a product picker (e.g. the order form) rather than the
// paginated table -- 100 is ProductCursorPagination's max_page_size, the
// most this can fetch in one request without a dedicated search endpoint.
export async function fetchProductOptions(): Promise<Product[]> {
  const page = await apiFetch<CursorPage<Product>>('/api/products/?page_size=100')
  return page.results
}

export interface CreateProductInput {
  name: string
  description: string
  sku: string
  price: string
  stock: number
  dosages: DosageInput[]
}

// The backend re-serializes the created product with its dosages
// included, since CreateProductInput's "dosages" field is write-only.
export function createProduct(input: CreateProductInput): Promise<ProductDetail> {
  return apiFetch<ProductDetail>('/api/products/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// Archives the product server-side rather than deleting the row (see
// ProductDetailView) -- past order line items still reference it.
export function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/api/products/${id}/`, { method: 'DELETE' })
}
