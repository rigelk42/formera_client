import {
  Descriptions,
  Empty,
  Modal,
  Spin,
  Table,
  Tag,
  type TableColumnsType,
} from 'antd'
import { useCustomer } from './useCustomer'
import type { Address } from './types'
import type { Order, OrderStatus } from '../orders/types'

const statusColor: Record<OrderStatus, string> = {
  pending: 'default',
  paid: 'blue',
  shipped: 'green',
  cancelled: 'red',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const addressColumns: TableColumnsType<Address> = [
  {
    title: 'Address',
    key: 'address',
    render: (_, address) =>
      address.line2 ? `${address.line1}, ${address.line2}` : address.line1,
  },
  { title: 'City', dataIndex: 'city', key: 'city' },
  { title: 'State', dataIndex: 'state', key: 'state' },
  { title: 'Postal code', dataIndex: 'postal_code', key: 'postal_code' },
  { title: 'Country', dataIndex: 'country', key: 'country' },
]

const orderColumns: TableColumnsType<Order> = [
  { title: 'Order #', dataIndex: 'id', key: 'id' },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
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
]

interface CustomerDetailModalProps {
  customerId: number | null
  onClose: () => void
}

export function CustomerDetailModal({ customerId, onClose }: CustomerDetailModalProps) {
  const { data: customer, isPending, isError } = useCustomer(customerId)

  return (
    <Modal
      title={customer ? `${customer.first_name} ${customer.last_name}` : 'Customer'}
      open={customerId !== null}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      {isPending ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : isError || !customer ? (
        <Empty description="Failed to load customer" />
      ) : (
        <>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
            <Descriptions.Item label="Email">{customer.email ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{customer.phone || '—'}</Descriptions.Item>
          </Descriptions>

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
            Shipping addresses
          </h3>
          <Table<Address>
            rowKey="id"
            dataSource={customer.addresses}
            columns={addressColumns}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            className="mb-6"
            locale={{ emptyText: <Empty description="No addresses on file" /> }}
          />

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
            Past orders
          </h3>
          <Table<Order>
            rowKey="id"
            dataSource={customer.orders}
            columns={orderColumns}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description="No past orders" /> }}
          />
        </>
      )}
    </Modal>
  )
}
