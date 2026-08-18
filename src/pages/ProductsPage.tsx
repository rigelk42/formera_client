import { useState } from 'react'
import { Alert, Button, Space, Table, type TableColumnsType } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ProductDetailModal } from '../products/ProductDetailModal'
import { ProductFormModal } from '../products/ProductFormModal'
import { useProducts } from '../products/useProducts'
import type { Product } from '../products/types'
import { getColumnSearchProps } from '../lib/columnSearch'
import { useFillHeight } from '../lib/useFillHeight'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: TableColumnsType<Product> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    ...getColumnSearchProps((product: Product) => product.name, 'name'),
  },
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price: string) => currency.format(Number(price)),
  },
  { title: 'Stock', dataIndex: 'stock', key: 'stock' },
]

export function ProductsPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, isPending, isFetching, isError } = useProducts(cursor)
  const [tableWrapRef, tableHeight] = useFillHeight(480)

  return (
    <section className="flex flex-1 flex-col px-5 pt-3 pb-1">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl! font-medium text-[var(--accent)]">Products</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          New product
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load products"
          showIcon
          className="mb-4"
        />
      )}

      <div ref={tableWrapRef} className="min-h-0 flex-1">
        <Table<Product>
          rowKey="id"
          loading={isPending}
          dataSource={data?.results ?? []}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: tableHeight }}
          onRow={(product) => ({
            onClick: () => setSelectedProductId(product.id),
            className: 'cursor-pointer',
          })}
        />
      </div>

      <div className="flex justify-center py-4">
        <Space>
          <Button
            disabled={!data?.previousCursor}
            onClick={() => setCursor(data?.previousCursor ?? null)}
          >
            Previous
          </Button>
          <Button
            disabled={!data?.nextCursor}
            loading={isFetching}
            onClick={() => setCursor(data?.nextCursor ?? null)}
          >
            Next
          </Button>
        </Space>
      </div>

      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />

      <ProductFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  )
}
