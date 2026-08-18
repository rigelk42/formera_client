import { Descriptions, Empty, Modal, Table, Tag, type TableColumnsType } from 'antd'
import type { Order, OrderLineItem, OrderStatus } from './types'

const statusColor: Record<OrderStatus, string> = {
  pending: 'default',
  paid: 'blue',
  shipped: 'green',
  cancelled: 'red',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const itemColumns: TableColumnsType<OrderLineItem> = [
  { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  {
    title: 'Unit price',
    dataIndex: 'unit_price',
    key: 'unit_price',
    render: (price: string) => currency.format(Number(price)),
  },
  {
    title: 'Subtotal',
    dataIndex: 'subtotal',
    key: 'subtotal',
    render: (amount: string) => currency.format(Number(amount)),
  },
]

interface OrderDetailModalProps {
  order: Order | null
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <Modal
      title={order ? `Order ${order.order_number}` : 'Order'}
      open={order !== null}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      {order && (
        <>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
            <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor[order.status]}>{order.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              {currency.format(Number(order.total_amount))}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {new Date(order.created_at).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
            Shipping address
          </h3>
          {order.shipping_address ? (
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
              <Descriptions.Item label="Address" span={2}>
                {order.shipping_address.line2
                  ? `${order.shipping_address.line1}, ${order.shipping_address.line2}`
                  : order.shipping_address.line1}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {order.shipping_address.city}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {order.shipping_address.state}
              </Descriptions.Item>
              <Descriptions.Item label="Postal code">
                {order.shipping_address.postal_code}
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {order.shipping_address.country}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="No shipping address on file" className="mb-6" />
          )}

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">Items</h3>
          <Table<OrderLineItem>
            rowKey="id"
            dataSource={order.items}
            columns={itemColumns}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content', y: 240 }}
          />
        </>
      )}
    </Modal>
  )
}
