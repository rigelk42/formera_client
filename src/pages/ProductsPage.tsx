import { useState } from 'react'
import { Alert, Button, Space, Table, type TableColumnsType } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ProductFormModal } from '../products/ProductFormModal'
import { useProducts } from '../products/useProducts'
import type { Product } from '../products/types'
import { getColumnSearchProps } from '../lib/columnSearch'

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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, isPending, isFetching, isError } = useProducts(cursor)

  return (
    <section className="px-5 py-3">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl! font-medium text-[var(--text-h)]">Products</h1>
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

      <Table<Product>
        rowKey="id"
        loading={isPending}
        dataSource={data?.results ?? []}
        columns={columns}
        pagination={false}
      />

      <Space className="mt-4">
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

      <ProductFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  )
}
