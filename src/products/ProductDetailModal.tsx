import {
  Button,
  Descriptions,
  Empty,
  Modal,
  Popconfirm,
  Spin,
  Table,
  type TableColumnsType,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useDeleteProduct } from './useDeleteProduct'
import { useProduct } from './useProduct'
import type { Dosage } from './types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const dosageColumns: TableColumnsType<Dosage> = [
  { title: 'Ingredient', dataIndex: 'ingredient_name', key: 'ingredient_name' },
  { title: 'Amount', dataIndex: 'display_amount', key: 'display_amount' },
]

interface ProductDetailModalProps {
  productId: number | null
  onClose: () => void
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { data: product, isPending, isError } = useProduct(productId)
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    if (!product) return
    await deleteProduct.mutateAsync(product.id)
    onClose()
  }

  return (
    <Modal
      title={
        product ? (
          <div className="flex items-center gap-3">
            <span>{product.name}</span>
            <Popconfirm
              title="Delete this product?"
              description="It will be removed from the catalog and product pickers."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={handleDelete}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deleteProduct.isPending}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        ) : (
          'Product'
        )
      }
      open={productId !== null}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      {isPending ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : isError || !product ? (
        <Empty description="Failed to load product" />
      ) : (
        <>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
            <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
            <Descriptions.Item label="Price">
              {currency.format(Number(product.price))}
            </Descriptions.Item>
            <Descriptions.Item label="Stock">{product.stock}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {product.description || '—'}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
            Ingredients
          </h3>
          <Table<Dosage>
            rowKey="id"
            dataSource={product.dosages}
            columns={dosageColumns}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content', y: 240 }}
            locale={{ emptyText: <Empty description="No ingredients on file" /> }}
          />
        </>
      )}
    </Modal>
  )
}
