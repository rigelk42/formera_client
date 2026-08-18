import { useState } from 'react'
import { Alert, Button, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useFillHeight } from '../lib/useFillHeight'
import { OrderDetailModal } from '../orders/OrderDetailModal'
import { OrderFormModal } from '../orders/OrderFormModal'
import { useOrders } from '../orders/useOrders'
import type { Order, OrderStatus } from '../orders/types'

const statusColor: Record<OrderStatus, string> = {
  pending: 'default',
  paid: 'blue',
  shipped: 'green',
  cancelled: 'red',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: TableColumnsType<Order> = [
  { title: 'Order #', dataIndex: 'order_number', key: 'order_number' },
  { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: OrderStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
  },
  {
    title: 'Total',
    dataIndex: 'total_amount',
    key: 'total_amount',
    render: (amount: string) => currency.format(Number(amount)),
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
]

export function OrdersPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data, isPending, isFetching, isError } = useOrders(cursor)
  const [tableWrapRef, tableHeight] = useFillHeight(480)

  return (
    <section className="flex flex-1 flex-col px-5 pt-3 pb-1">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl! font-medium text-[var(--accent)]">Orders</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          New order
        </Button>
      </div>

      {isError && (
        <Alert type="error" message="Failed to load orders" showIcon className="mb-4" />
      )}

      <div ref={tableWrapRef} className="min-h-0 flex-1">
        <Table<Order>
          rowKey="id"
          loading={isPending}
          dataSource={data?.results ?? []}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: tableHeight }}
          onRow={(order) => ({
            onClick: () => setSelectedOrder(order),
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

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <OrderFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  )
}
