import type { FormInstance } from 'antd'
import { ApiError } from './api'

// Attaches DRF field-validation errors directly to the matching Form.Item
// and returns null; for errors without a field breakdown (auth/permission
// failures, network errors), returns a message for a general-purpose alert.
export function applyApiError(error: unknown, form: FormInstance): string | null {
  if (error instanceof ApiError) {
    if (error.fields) {
      // "non_field_errors" is DRF's convention for a serializer-level
      // ValidationError raised from validate() rather than tied to one
      // field (e.g. OrderCreateSerializer's "provide exactly one of
      // customer_id/new_customer", or OrderUpdateSerializer's "this order
      // already has a shipping label"). There's no Form.Item to attach it
      // to, so surface it as a general alert instead of silently
      // form.setFields()-ing it onto a field that doesn't exist.
      const { non_field_errors, ...fieldErrors } = error.fields
      if (Object.keys(fieldErrors).length > 0) {
        form.setFields(
          Object.entries(fieldErrors).map(([name, errors]) => ({ name, errors })),
        )
      }
      return non_field_errors?.[0] ?? null
    }
    return error.message
  }
  return 'Something went wrong.'
}
