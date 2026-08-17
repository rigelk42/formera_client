import type { FormInstance } from 'antd'
import { ApiError } from './api'

// Attaches DRF field-validation errors directly to the matching Form.Item
// and returns null; for errors without a field breakdown (auth/permission
// failures, network errors), returns a message for a general-purpose alert.
export function applyApiError(error: unknown, form: FormInstance): string | null {
  if (error instanceof ApiError) {
    if (error.fields) {
      form.setFields(
        Object.entries(error.fields).map(([name, errors]) => ({ name, errors })),
      )
      return null
    }
    return error.message
  }
  return 'Something went wrong.'
}
