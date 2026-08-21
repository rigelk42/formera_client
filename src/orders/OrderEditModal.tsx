import { useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { AddressFields } from '../components/AddressFields'
import { applyApiError } from '../lib/formErrors'
import { useProductOptions } from '../products/useProductOptions'
import { NEW_PRODUCT_OPTION, OrderLineItemFields } from './OrderLineItemFields'
import { ORDER_STATUS_OPTIONS } from './orderStatusOptions'
import { useUpdateOrder } from './useUpdateOrder'
import type { UpdateOrderInput } from './api'
import type { OrderItemValue } from './OrderLineItemFields'
import type { Order, OrderStatus } from './types'

interface OrderEditFormValues {
  status: OrderStatus
  includeDiscount?: boolean
  discount?: number
  includeAddress?: boolean
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  items: OrderItemValue[]
}

interface OrderEditModalProps {
  order: Order | null
  onClose: () => void
  onUpdated: (order: Order) => void
}

function buildInitialValues(order: Order): OrderEditFormValues {
  return {
    status: order.status,
    includeDiscount: order.discount != null,
    discount: order.discount ?? undefined,
    includeAddress: order.shipping_address != null,
    address: order.shipping_address ?? undefined,
    items: order.items.map((item) => ({
      id: item.id,
      productLabel: item.product_name,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
    })),
  }
}

export function OrderEditModal({ order, onClose, onUpdated }: OrderEditModalProps) {
  const [form] = Form.useForm<OrderEditFormValues>()
  const [error, setError] = useState<string | null>(null)
  const updateOrder = useUpdateOrder()
  const { data: productOptions, isPending: productsLoading } = useProductOptions()

  const includeDiscount = Form.useWatch('includeDiscount', form)
  const includeAddress = Form.useWatch('includeAddress', form)

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const handleFinish = async (values: OrderEditFormValues) => {
    if (!order) return
    setError(null)

    const input: UpdateOrderInput = {
      status: values.status,
      // Always sent (not just when changing): unchecking the box after a
      // discount was previously applied needs to explicitly clear it, not
      // silently leave the old value in place.
      discount: values.includeDiscount ? (values.discount ?? null) : null,
      items: values.items.map((item) => {
        if (item.id !== undefined) {
          return { id: item.id, quantity: item.quantity, unit_price: item.unit_price }
        }
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
    }

    if (values.includeAddress && values.address) {
      input.shipping_address = {
        line1: values.address.line1,
        line2: values.address.line2 ?? '',
        city: values.address.city,
        state: values.address.state,
        postal_code: values.address.postal_code,
        country: values.address.country,
      }
    }

    try {
      const updated = await updateOrder.mutateAsync({ orderId: order.id, input })
      onUpdated(updated)
      message.success(`Order ${updated.order_number} updated`)
      onClose()
    } catch (err) {
      setError(applyApiError(err, form))
    }
  }

  return (
    <Modal
      title={order ? `Edit ${order.order_number}` : 'Edit order'}
      open={order !== null}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={updateOrder.isPending}
      okText="Save changes"
      width={640}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      {order && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={buildInitialValues(order)}
        >
          {error && <Alert type="error" message={error} showIcon className="mb-4" />}

          <Form.Item label="Payment" name="status">
            <Select options={ORDER_STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item name="includeDiscount" valuePropName="checked" className="mb-2">
            <Checkbox>Apply a discount</Checkbox>
          </Form.Item>

          {includeDiscount && (
            <Form.Item
              label="Discount"
              name="discount"
              rules={[
                { required: true, message: 'Enter a discount between 1 and 100' },
              ]}
            >
              <InputNumber min={1} max={100} step={1} addonAfter="%" />
            </Form.Item>
          )}

          {order.shipping_address ? (
            <>
              <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
                Shipping address
              </h3>
              <AddressFields form={form} name={['address']} />
            </>
          ) : (
            <>
              <Form.Item name="includeAddress" valuePropName="checked" className="mb-2">
                <Checkbox>Add a shipping address</Checkbox>
              </Form.Item>
              {includeAddress && <AddressFields form={form} name={['address']} />}
            </>
          )}

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-h)]">
                    Items
                  </span>
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
      )}
    </Modal>
  )
}
