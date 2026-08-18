import { useState } from 'react'
import {
  Button,
  Descriptions,
  Empty,
  message,
  Modal,
  Table,
  Tag,
  type TableColumnsType,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { ApiError } from '../lib/api'
import { fetchOrderInvoice } from './api'
import { ShipmentPanel } from './ShipmentPanel'
import type { Order, OrderLineItem, OrderStatus } from './types'

const statusColor: Record<OrderStatus, string> = {
  paid: 'blue',
  cash_pickup: 'green',
  referral: 'purple',
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
  const [downloading, setDownloading] = useState(false)
  // Local override so shipment actions (which return the updated order)
  // reflect immediately in this modal, without waiting on the parent
  // list's own refetch timing. Reset (during render, not an effect --
  // see https://react.dev/learn/you-might-not-need-an-effect) whenever a
  // different order prop comes in.
  const [prevOrderId, setPrevOrderId] = useState(order?.id)
  const [liveOrder, setLiveOrder] = useState(order)
  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id)
    setLiveOrder(order)
  }

  const handleDownloadInvoice = async () => {
    if (!order) return
    setDownloading(true)
    try {
      const { blob, filename } = await fetchOrderInvoice(order.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename ?? `invoice-${order.order_number}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      message.error(
        err instanceof ApiError ? err.message : 'Failed to download invoice.',
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Modal
      title={
        order ? (
          <div className="flex items-center gap-3">
            <span>Order {order.order_number}</span>
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownloadInvoice}
            >
              Get Invoice
            </Button>
          </div>
        ) : (
          'Order'
        )
      }
      open={order !== null}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      {liveOrder && (
        <>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
            <Descriptions.Item label="Customer">
              {liveOrder.customer_name}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor[liveOrder.status]}>
                {liveOrder.status.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
            {liveOrder.discount && (
              <Descriptions.Item label="Discount">{liveOrder.discount}%</Descriptions.Item>
            )}
            <Descriptions.Item label="Total">
              {currency.format(Number(liveOrder.total_amount))}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {new Date(liveOrder.created_at).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">
            Shipping address
          </h3>
          {liveOrder.shipping_address ? (
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="mb-6">
              <Descriptions.Item label="Address" span={2}>
                {liveOrder.shipping_address.line2
                  ? `${liveOrder.shipping_address.line1}, ${liveOrder.shipping_address.line2}`
                  : liveOrder.shipping_address.line1}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {liveOrder.shipping_address.city}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {liveOrder.shipping_address.state}
              </Descriptions.Item>
              <Descriptions.Item label="Postal code">
                {liveOrder.shipping_address.postal_code}
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {liveOrder.shipping_address.country}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="No shipping address on file" className="mb-6" />
          )}

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">Shipping</h3>
          <div className="mb-6">
            <ShipmentPanel order={liveOrder} onUpdated={setLiveOrder} />
          </div>

          <h3 className="mb-2 text-base font-medium text-[var(--text-h)]">Items</h3>
          <Table<OrderLineItem>
            rowKey="id"
            dataSource={liveOrder.items}
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
