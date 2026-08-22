import { useState } from 'react'
import { Alert, Form, Input, message, Modal } from 'antd'
import { applyApiError } from '../lib/formErrors'
import { useUpdateCustomer } from './useUpdateCustomer'
import type { CustomerDetail } from './types'

interface CustomerEditFormValues {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}

interface CustomerEditModalProps {
  customer: CustomerDetail | null
  onClose: () => void
}

export function CustomerEditModal({ customer, onClose }: CustomerEditModalProps) {
  const [form] = Form.useForm<CustomerEditFormValues>()
  const [error, setError] = useState<string | null>(null)
  const updateCustomer = useUpdateCustomer()

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const handleFinish = async (values: CustomerEditFormValues) => {
    if (!customer) return
    setError(null)
    try {
      const updated = await updateCustomer.mutateAsync({
        customerId: customer.id,
        input: {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || null,
          phone: values.phone ?? '',
        },
      })
      message.success(`${updated.first_name} ${updated.last_name} updated`)
      onClose()
    } catch (err) {
      setError(applyApiError(err, form))
    }
  }

  return (
    <Modal
      title={
        customer ? `Edit ${customer.first_name} ${customer.last_name}` : 'Edit customer'
      }
      open={customer !== null}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={updateCustomer.isPending}
      okText="Save changes"
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      {customer && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email ?? undefined,
            phone: customer.phone,
          }}
        >
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
        </Form>
      )}
    </Modal>
  )
}
