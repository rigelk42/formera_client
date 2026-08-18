import { useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Space,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { applyApiError } from '../lib/formErrors'
import { useCustomer } from '../customers/useCustomer'
import { useCustomerOptions } from '../customers/useCustomerOptions'
import { useProductOptions } from '../products/useProductOptions'
import { useCreateOrder } from './useCreateOrder'
import type { CreateOrderInput } from './api'

interface OrderFormValues {
  customerMode: 'existing' | 'new'
  customerId?: number
  newCustomer?: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  includeAddress?: boolean
  addressMode?: 'existing' | 'new'
  addressId?: number
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  items: { product: number; quantity: number }[]
}

interface OrderFormModalProps {
  open: boolean
  onClose: () => void
}

export function OrderFormModal({ open, onClose }: OrderFormModalProps) {
  const [form] = Form.useForm<OrderFormValues>()
  const [error, setError] = useState<string | null>(null)
  const createOrder = useCreateOrder()

  const customerMode = Form.useWatch('customerMode', form) ?? 'existing'
  const customerId = Form.useWatch('customerId', form)
  const includeAddress = Form.useWatch('includeAddress', form)
  const addressMode = Form.useWatch('addressMode', form) ?? 'new'

  const { data: customerOptions, isPending: customersLoading } = useCustomerOptions()
  const { data: productOptions, isPending: productsLoading } = useProductOptions()
  const { data: selectedCustomer } = useCustomer(
    customerMode === 'existing' ? (customerId ?? null) : null,
  )
  const existingAddresses = selectedCustomer?.addresses ?? []
  const canUseExistingAddress =
    customerMode === 'existing' && existingAddresses.length > 0

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const handleFinish = async (values: OrderFormValues) => {
    setError(null)

    const address =
      includeAddress && addressMode === 'existing' && canUseExistingAddress
        ? existingAddresses.find((a) => a.id === values.addressId)
        : includeAddress
          ? values.address
          : undefined

    const input: CreateOrderInput = {
      items: values.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      shipping_address: address
        ? {
            line1: address.line1,
            line2: address.line2 ?? '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
          }
        : undefined,
    }

    if (values.customerMode === 'existing') {
      input.customer_id = values.customerId
    } else {
      input.new_customer = {
        first_name: values.newCustomer?.first_name ?? '',
        last_name: values.newCustomer?.last_name ?? '',
        email: values.newCustomer?.email || null,
        phone: values.newCustomer?.phone ?? '',
      }
    }

    try {
      const order = await createOrder.mutateAsync(input)
      message.success(`Order ${order.order_number} created for ${order.customer_name}`)
      onClose()
    } catch (err) {
      setError(applyApiError(err, form))
    }
  }

  return (
    <Modal
      title="New order"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createOrder.isPending}
      okText="Create order"
      width={640}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          customerMode: 'existing',
          addressMode: 'new',
          items: [{ quantity: 1 }],
        }}
      >
        {error && <Alert type="error" message={error} showIcon className="mb-4" />}

        <Form.Item label="Customer" name="customerMode">
          <Radio.Group>
            <Radio.Button value="existing">Existing customer</Radio.Button>
            <Radio.Button value="new">New customer</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {customerMode === 'existing' ? (
          <Form.Item
            name="customerId"
            rules={[{ required: true, message: 'Select a customer' }]}
          >
            <Select
              showSearch
              placeholder="Select a customer"
              loading={customersLoading}
              optionFilterProp="label"
              options={(customerOptions ?? []).map((customer) => ({
                value: customer.id,
                label: `${customer.first_name} ${customer.last_name}`,
              }))}
            />
          </Form.Item>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Form.Item
                label="First name"
                name={['newCustomer', 'first_name']}
                rules={[{ required: true, message: 'First name is required' }]}
                className="flex-1"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Last name"
                name={['newCustomer', 'last_name']}
                rules={[{ required: true, message: 'Last name is required' }]}
                className="flex-1"
              >
                <Input />
              </Form.Item>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Form.Item
                label="Email"
                name={['newCustomer', 'email']}
                rules={[{ type: 'email', message: 'Enter a valid email address' }]}
                className="flex-1"
              >
                <Input type="email" />
              </Form.Item>
              <Form.Item
                label="Phone"
                name={['newCustomer', 'phone']}
                className="flex-1"
              >
                <Input />
              </Form.Item>
            </div>
          </>
        )}

        <Form.Item name="includeAddress" valuePropName="checked" className="mb-2">
          <Checkbox>Add a shipping address</Checkbox>
        </Form.Item>

        {includeAddress && (
          <>
            {canUseExistingAddress && (
              <Form.Item name="addressMode">
                <Radio.Group>
                  <Radio.Button value="existing">Use existing address</Radio.Button>
                  <Radio.Button value="new">Enter new address</Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}

            {addressMode === 'existing' && canUseExistingAddress ? (
              <Form.Item
                name="addressId"
                rules={[{ required: true, message: 'Select an address' }]}
              >
                <Select
                  placeholder="Select an address"
                  options={existingAddresses.map((a) => ({
                    value: a.id,
                    label: `${a.line1}${a.line2 ? `, ${a.line2}` : ''}, ${a.city}, ${a.state} ${a.postal_code}`,
                  }))}
                />
              </Form.Item>
            ) : (
              <>
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
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Form.Item
                    label="City"
                    name={['address', 'city']}
                    rules={[{ required: true, message: 'City is required' }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="State"
                    name={['address', 'state']}
                    rules={[{ required: true, message: 'State is required' }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Form.Item
                    label="Postal code"
                    name={['address', 'postal_code']}
                    rules={[{ required: true, message: 'Postal code is required' }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Country"
                    name={['address', 'country']}
                    rules={[{ required: true, message: 'Country is required' }]}
                    className="flex-1"
                  >
                    <Input />
                  </Form.Item>
                </div>
              </>
            )}
          </>
        )}

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-h)]">Items</span>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => add({ quantity: 1 })}
                >
                  Add item
                </Button>
              </div>
              {fields.map((field) => (
                <Space
                  key={field.key}
                  align="baseline"
                  className="mb-2 flex flex-wrap"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, 'product']}
                    rules={[{ required: true, message: 'Select a product' }]}
                    className="mb-0 w-full sm:w-64"
                  >
                    <Select
                      showSearch
                      placeholder="Select a product"
                      loading={productsLoading}
                      optionFilterProp="label"
                      options={(productOptions ?? []).map((product) => ({
                        value: product.id,
                        label: `${product.name} — $${product.price}`,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'quantity']}
                    rules={[{ required: true, message: 'Quantity is required' }]}
                    className="mb-0"
                  >
                    <InputNumber min={1} step={1} placeholder="Qty" />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                    disabled={fields.length === 1}
                  />
                </Space>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
