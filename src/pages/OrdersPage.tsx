import { lazy, Suspense, useMemo, useState } from 'react'
import { Alert, Button, Space, Table, Tag, type TableColumnsType } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useFillHeight } from '../lib/useFillHeight'
import { formatWeekRange } from '../lib/weekGroups'
import { useOrders } from '../orders/useOrders'
import type { OrderWeekGroup } from '../orders/api'
import type { Order, OrderStatus } from '../orders/types'

const OrderDetailModal = lazy(() =>
  import('../orders/OrderDetailModal').then((m) => ({ default: m.OrderDetailModal })),
)
const OrderFormModal = lazy(() =>
  import('../orders/OrderFormModal').then((m) => ({ default: m.OrderFormModal })),
)

const statusColor: Record<OrderStatus, string> = {
  paid: 'blue',
  cash_pickup: 'green',
  referral: 'purple',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface WeekHeaderRow {
  isWeekHeader: true
  rowKey: string
  label: string
  total: number
}

type OrderRow = Order | WeekHeaderRow

function isWeekHeaderRow(row: OrderRow): row is WeekHeaderRow {
  return 'isWeekHeader' in row
}

// Flattens the backend's already-grouped-by-week response into a single
// row list, with a section-header row inserted before each week's orders
// -- grouping happens server-side (see OrderWeekPagination) so a week is
// never split across two pages.
function buildRows(weeks: OrderWeekGroup[]): OrderRow[] {
  const rows: OrderRow[] = []

  for (const week of weeks) {
    // No "Z"/offset suffix, so this parses as local midnight rather than
    // UTC midnight -- avoids the label showing the wrong day in
    // timezones behind UTC.
    const weekStart = new Date(`${week.week_start}T00:00:00`)
    const total = week.orders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    )
    rows.push({
      isWeekHeader: true,
      rowKey: `week-${week.week_start}`,
      label: formatWeekRange(weekStart),
      total,
    })
    rows.push(...week.orders)
  }

  return rows
}

const columns: TableColumnsType<OrderRow> = [
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    // First column carries the merged week-header cell (label + total).
    onCell: (row) => (isWeekHeaderRow(row) ? { colSpan: 5 } : {}),
    render: (_, row) =>
      isWeekHeaderRow(row) ? (
        <div className="flex items-center justify-between">
          <span>{row.label}</span>
          <span>Week Total: {currency.format(row.total)}</span>
        </div>
      ) : (
        new Date(row.created_at).toLocaleDateString()
      ),
  },
  {
    title: 'Order #',
    dataIndex: 'order_number',
    key: 'order_number',
    onCell: (row) => (isWeekHeaderRow(row) ? { colSpan: 0 } : {}),
    render: (_, row) => (isWeekHeaderRow(row) ? null : row.order_number),
  },
  {
    title: 'Customer',
    dataIndex: 'customer_name',
    key: 'customer_name',
    onCell: (row) => (isWeekHeaderRow(row) ? { colSpan: 0 } : {}),
    render: (_, row) => (isWeekHeaderRow(row) ? null : row.customer_name),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    onCell: (row) => (isWeekHeaderRow(row) ? { colSpan: 0 } : {}),
    render: (_, row) =>
      isWeekHeaderRow(row) ? null : (
        <Tag color={statusColor[row.status as OrderStatus]}>
          {row.status.replace('_', ' ')}
        </Tag>
      ),
  },
  {
    title: 'Total',
    dataIndex: 'total_amount',
    key: 'total_amount',
    onCell: (row) => (isWeekHeaderRow(row) ? { colSpan: 0 } : {}),
    render: (_, row) =>
      isWeekHeaderRow(row) ? null : currency.format(Number(row.total_amount)),
  },
]

export function OrdersPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data, isPending, isFetching, isError } = useOrders(cursor)
  const [tableWrapRef, tableHeight] = useFillHeight(480)
  const rows = useMemo(() => buildRows(data?.weeks ?? []), [data?.weeks])

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
        <Table<OrderRow>
          rowKey={(row) => (isWeekHeaderRow(row) ? row.rowKey : row.id)}
          loading={isPending}
          dataSource={rows}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: tableHeight }}
          onRow={(row) =>
            isWeekHeaderRow(row)
              ? { className: 'week-header-row' }
              : {
                  onClick: () => setSelectedOrder(row),
                  className: 'cursor-pointer',
                }
          }
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

      <Suspense fallback={null}>
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />

        <OrderFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </Suspense>
    </section>
  )
}
