import { useState } from 'react'
import { Alert, Button, Form, Input, InputNumber, Modal, Space } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { applyApiError } from '../lib/formErrors'
import { useCreateProduct } from './useCreateProduct'

interface ProductFormValues {
  name: string
  description?: string
  sku: string
  price: number
  stock?: number
  dosages?: { ingredient_name: string; amount: number }[]
}

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
}

export function ProductFormModal({ open, onClose }: ProductFormModalProps) {
  const [form] = Form.useForm<ProductFormValues>()
  const [error, setError] = useState<string | null>(null)
  const createProduct = useCreateProduct()

  const handleCancel = () => {
    setError(null)
    onClose()
  }

  const handleFinish = async (values: ProductFormValues) => {
    setError(null)
    try {
      await createProduct.mutateAsync({
        name: values.name,
        description: values.description ?? '',
        sku: values.sku,
        price: values.price.toFixed(2),
        stock: values.stock ?? 0,
        dosages: (values.dosages ?? []).map((dosage) => ({
          ingredient_name: dosage.ingredient_name,
          amount: dosage.amount.toFixed(3),
          unit: 'mg',
        })),
      })
      onClose()
    } catch (err) {
      setError(applyApiError(err, form))
    }
  }

  return (
    <Modal
      title="New product"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createProduct.isPending}
      okText="Create"
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ stock: 0 }}
      >
        {error && <Alert type="error" message={error} showIcon className="mb-4" />}
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="SKU"
          name="sku"
          rules={[{ required: true, message: 'SKU is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Price is required' }]}
        >
          <InputNumber min={0} precision={2} prefix="$" className="w-full" />
        </Form.Item>
        <Form.Item label="Stock" name="stock">
          <InputNumber min={0} step={1} className="w-full" />
        </Form.Item>

        <Form.List name="dosages">
          {(fields, { add, remove }) => (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-h)]">
                  Ingredients
                </span>
                <Button size="small" icon={<PlusOutlined />} onClick={() => add()}>
                  Add ingredient
                </Button>
              </div>
              {fields.map((field) => (
                <Space key={field.key} align="baseline" className="mb-2 flex flex-wrap">
                  <Form.Item
                    {...field}
                    name={[field.name, 'ingredient_name']}
                    rules={[{ required: true, message: 'Ingredient name is required' }]}
                    className="mb-0 min-w-40 flex-1"
                  >
                    <Input placeholder="Ingredient name" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'amount']}
                    rules={[{ required: true, message: 'Amount is required' }]}
                    className="mb-0"
                  >
                    <InputNumber
                      min={0}
                      precision={3}
                      addonAfter="mg"
                      placeholder="Amount"
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
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
