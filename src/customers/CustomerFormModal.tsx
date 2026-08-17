import { useState } from 'react'
import { Alert, Checkbox, Form, Input, Modal } from 'antd'
import { applyApiError } from '../lib/formErrors'
import { useCreateCustomer } from './useCreateCustomer'

interface CustomerFormValues {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  includeAddress?: boolean
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

interface CustomerFormModalProps {
  open: boolean
  onClose: () => void
}

export function CustomerFormModal({ open, onClose }: CustomerFormModalProps) {
  const [form] = Form.useForm<CustomerFormValues>()
  const [error, setError] = useState<string | null>(null)
  const createCustomer = useCreateCustomer()

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const handleFinish = async (values: CustomerFormValues) => {
    setError(null)
    try {
      await createCustomer.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone ?? '',
        address:
          values.includeAddress && values.address
            ? {
                line1: values.address.line1,
                line2: values.address.line2 ?? '',
                city: values.address.city,
                state: values.address.state,
                postal_code: values.address.postal_code,
                country: values.address.country,
              }
            : undefined,
      })
      onClose()
    } catch (err) {
      setError(applyApiError(err, form))
    }
  }

  return (
    <Modal
      title="New customer"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createCustomer.isPending}
      okText="Create"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {error && <Alert type="error" message={error} showIcon className="mb-4" />}
        <Form.Item
          label="First name"
          name="first_name"
          rules={[{ required: true, message: 'First name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last name"
          name="last_name"
          rules={[{ required: true, message: 'Last name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ type: 'email', message: 'Enter a valid email address' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>

        <Form.Item name="includeAddress" valuePropName="checked" className="mb-0">
          <Checkbox>Add a shipping address</Checkbox>
        </Form.Item>

        <Form.Item
          shouldUpdate={(prev, cur) => prev.includeAddress !== cur.includeAddress}
          noStyle
        >
          {({ getFieldValue }) =>
            getFieldValue('includeAddress') ? (
              <div className="mt-4">
                <Form.Item
                  label="Address line 1"
                  name={['address', 'line1']}
                  rules={[{ required: true, message: 'Address line 1 is required' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Address line 2" name={['address', 'line2']}>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="City"
                  name={['address', 'city']}
                  rules={[{ required: true, message: 'City is required' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="State"
                  name={['address', 'state']}
                  rules={[{ required: true, message: 'State is required' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Postal code"
                  name={['address', 'postal_code']}
                  rules={[{ required: true, message: 'Postal code is required' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Country"
                  name={['address', 'country']}
                  rules={[{ required: true, message: 'Country is required' }]}
                >
                  <Input />
                </Form.Item>
              </div>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  )
}
