import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { AddressFields } from '../components/AddressFields'
import { applyApiError } from '../lib/formErrors'
import { useCustomer } from '../customers/useCustomer'
import { useCustomerOptions } from '../customers/useCustomerOptions'
import { useProductOptions } from '../products/useProductOptions'
import { useCreateOrder } from './useCreateOrder'
import { NEW_PRODUCT_OPTION, OrderLineItemFields } from './OrderLineItemFields'
import { ORDER_STATUS_OPTIONS } from './orderStatusOptions'
import type { CreateOrderInput } from './api'
import type { OrderItemValue } from './OrderLineItemFields'
import type { OrderStatus } from './types'

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
  includeDiscount?: boolean
  discount?: number
  status: OrderStatus
  items: OrderItemValue[]
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
  const includeDiscount = Form.useWatch('includeDiscount', form)

  const { data: customerOptions, isPending: customersLoading } = useCustomerOptions()
  const { data: productOptions, isPending: productsLoading } = useProductOptions()
  const { data: selectedCustomer } = useCustomer(
    customerMode === 'existing' ? (customerId ?? null) : null,
  )
  const existingAddresses = selectedCustomer?.addresses ?? []
  const canUseExistingAddress =
    customerMode === 'existing' && existingAddresses.length > 0

  // Defaults to the customer's first address so placing an order for a
  // repeat customer doesn't require re-clicking through "add address" ->
  // "use existing" -> pick-from-list every time. Still just a default --
  // switching customers re-derives it, and the user can change it via the
  // fields below.
  useEffect(() => {
    if (customerMode !== 'existing' || !selectedCustomer) return

    if ((selectedCustomer.addresses ?? []).length > 0) {
      form.setFieldsValue({
        includeAddress: true,
        addressMode: 'existing',
        addressId: selectedCustomer.addresses[0].id,
      })
    } else {
      form.setFieldsValue({ addressMode: 'new' })
    }
  }, [selectedCustomer, customerMode, form])

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
      status: values.status,
      items: values.items.map((item) => {
        if (item.product === NEW_PRODUCT_OPTION) {
          return {
            new_product: {
              name: item.newProductName ?? '',
              price: item.unit_price ?? 0,
            },
            quantity: item.quantity,
            unit_price: item.unit_price,
          }
        }
        return {
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }
      }),
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
      discount: values.includeDiscount ? values.discount : undefined,
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
      await createOrder.mutateAsync(input)
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
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          customerMode: 'existing',
          addressMode: 'new',
          status: 'cash_pickup',
          items: [{ quantity: 1 }],
        }}
      >
        {error && <Alert type="error" message={error} showIcon className="mb-4" />}

        <Form.Item label="Payment" name="status">
          <Select options={ORDER_STATUS_OPTIONS} />
        </Form.Item>

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
              <AddressFields form={form} name={['address']} />
            )}
          </>
        )}

        <Form.Item name="includeDiscount" valuePropName="checked" className="mb-2">
          <Checkbox>Apply a discount</Checkbox>
        </Form.Item>

        {includeDiscount && (
          <Form.Item
            label="Discount"
            name="discount"
            rules={[{ required: true, message: 'Enter a discount between 1 and 100' }]}
          >
            <InputNumber min={1} max={100} step={1} addonAfter="%" />
          </Form.Item>
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
                <OrderLineItemFields
                  key={field.key}
                  form={form}
                  field={field}
                  productOptions={productOptions}
                  productsLoading={productsLoading}
                  onRemove={() => remove(field.name)}
                  removeDisabled={fields.length === 1}
                />
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
