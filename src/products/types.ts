export interface Product {
  id: number
  name: string
  description: string
  sku: string
  // DRF serializes DecimalField as a string to avoid float precision loss
  price: string
  stock: number
  created_at: string
  updated_at: string
}

// Only milligrams are supported by the backend today.
export type DosageUnit = 'mg'

export interface Dosage {
  id: number
  product: number
  ingredient: number
  ingredient_name: string
  amount: string
  unit: DosageUnit
  display_amount: string
}

export interface DosageInput {
  ingredient_name: string
  amount: string
  unit: DosageUnit
}

export interface ProductDetail extends Product {
  dosages: Dosage[]
}
