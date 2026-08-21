import { Button, Form, Input, InputNumber, Select, Space } from 'antd'
import { MinusCircleOutlined } from '@ant-design/icons'
import type { FormInstance, FormListFieldData } from 'antd'
import type { Product } from '../products/types'

// Not a real product id -- selecting this option switches the row into
// "new product" mode instead of picking one from the catalog. Doubles as
// the value stored in the "product" form field while in that mode, so no
// separate mode field is needed.
export const NEW_PRODUCT_OPTION = '__new_product__' as const

export interface OrderItemValue {
  // Present only when this row is an already-existing line item being
  // edited (see OrderEditModal) -- absent for a brand new row, whether in
  // the create form or added to an order being edited.
  id?: number
  // Display-only product name for an existing item (id is set) -- an
  // existing item's product can't be changed here, only quantity/price,
  // so there's no picker to derive a label from. Never sent to the API.
  productLabel?: string
  product?: number | typeof NEW_PRODUCT_OPTION
  newProductName?: string
  quantity: number
  unit_price?: number
}

interface OrderLineItemFieldsProps {
  form: FormInstance
  field: FormListFieldData
  productOptions: Product[] | undefined
  productsLoading: boolean
  onRemove: () => void
  removeDisabled: boolean
}

export function OrderLineItemFields({
  form,
  field,
  productOptions,
  productsLoading,
  onRemove,
  removeDisabled,
}: OrderLineItemFieldsProps) {
  const selectedProduct = Form.useWatch(['items', field.name, 'product'], form)
  const isNewProduct = selectedProduct === NEW_PRODUCT_OPTION
  const existingItemId = Form.useWatch(['items', field.name, 'id'], form)
  const productLabel = Form.useWatch(['items', field.name, 'productLabel'], form)
  const isExistingItem = existingItemId !== undefined

  return (
    <Space align="baseline" className="mb-2 flex flex-wrap">
      {isExistingItem ? (
        <div className="w-full sm:w-64">
          <span className="text-[var(--text)]">{productLabel}</span>
        </div>
      ) : isNewProduct ? (
        <div className="flex w-full flex-col items-start gap-1 sm:w-64">
          <Form.Item
            {...field}
            name={[field.name, 'newProductName']}
            rules={[{ required: true, message: 'Product name is required' }]}
            className="mb-0 w-full"
          >
            <Input placeholder="New product name" />
          </Form.Item>
          <Button
            type="link"
            size="small"
            className="!h-auto !p-0"
            onClick={() => {
              form.setFieldValue(['items', field.name, 'product'], undefined)
              form.setFieldValue(['items', field.name, 'newProductName'], undefined)
            }}
          >
            Choose an existing product instead
          </Button>
        </div>
      ) : (
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
            options={[
              ...(productOptions ?? []).map((product) => ({
                value: product.id,
                label: `${product.name} — $${product.price}`,
              })),
              { value: NEW_PRODUCT_OPTION, label: '+ Add new product' },
            ]}
            // Prefills the price field with this product's catalog price
            // -- still just a default, edited below to record a
            // negotiated/custom price. Picking "+ Add new product"
            // instead clears it: what's typed there becomes both the new
            // catalog price and this line item's price -- see
            // OrderFormModal.handleFinish.
            onChange={(value: number | typeof NEW_PRODUCT_OPTION) => {
              if (value === NEW_PRODUCT_OPTION) {
                form.setFieldValue(['items', field.name, 'unit_price'], undefined)
                return
              }
              const product = (productOptions ?? []).find((p) => p.id === value)
              if (product) {
                form.setFieldValue(
                  ['items', field.name, 'unit_price'],
                  Number(product.price),
                )
              }
            }}
          />
        </Form.Item>
      )}
      <Form.Item
        {...field}
        name={[field.name, 'quantity']}
        rules={[{ required: true, message: 'Quantity is required' }]}
        className="mb-0"
      >
        <InputNumber min={1} step={1} placeholder="Qty" />
      </Form.Item>
      <Form.Item
        {...field}
        name={[field.name, 'unit_price']}
        rules={[{ required: true, message: 'Price is required' }]}
        className="mb-0"
      >
        <InputNumber
          min={0}
          step={0.01}
          precision={2}
          addonBefore="$"
          placeholder={isNewProduct ? 'New product price' : undefined}
        />
      </Form.Item>
      <Button
        type="text"
        danger
        icon={<MinusCircleOutlined />}
        onClick={onRemove}
        disabled={removeDisabled}
      />
    </Space>
  )
}
