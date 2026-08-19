import { useState } from 'react'
import {
  Button,
  Descriptions,
  Empty,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  Tag,
  type TableColumnsType,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { ApiError } from '../lib/api'
import { fetchOrderInvoice } from './api'
import { ShipmentPanel } from './ShipmentPanel'
import { useUpdateOrderLineItemPrice } from './useOrderLineItem'
import type { Order, OrderLineItem, OrderStatus } from './types'

const statusColor: Record<OrderStatus, string> = {
  paid: 'blue',
  cash_pickup: 'green',
  referral: 'purple',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

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

  // Which line item's price is currently in edit mode, and the value of
  // its (not-yet-saved) input -- null editingItemId means every row shows
  // its plain price + pencil icon.
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const updatePrice = useUpdateOrderLineItemPrice()

  const startEditingPrice = (item: OrderLineItem) => {
    setEditingItemId(item.id)
    setEditingPrice(Number(item.unit_price))
  }

  const cancelEditingPrice = () => {
    setEditingItemId(null)
    setEditingPrice(null)
  }

  const saveEditingPrice = async (itemId: number) => {
    if (!liveOrder || editingPrice == null) return
    try {
      const updated = await updatePrice.mutateAsync({
        orderId: liveOrder.id,
        itemId,
        unitPrice: editingPrice,
      })
      setLiveOrder(updated)
      setEditingItemId(null)
      message.success('Price updated.')
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : 'Failed to update price.')
    }
  }

  const itemColumns: TableColumnsType<OrderLineItem> = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Unit price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: string, item) =>
        editingItemId === item.id ? (
          <Space>
            <InputNumber
              autoFocus
              min={0}
              step={0.01}
              precision={2}
              addonBefore="$"
              value={editingPrice}
              onChange={setEditingPrice}
              onPressEnter={() => saveEditingPrice(item.id)}
              disabled={updatePrice.isPending}
            />
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              loading={updatePrice.isPending}
              onClick={() => saveEditingPrice(item.id)}
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              disabled={updatePrice.isPending}
              onClick={cancelEditingPrice}
            />
          </Space>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            {currency.format(Number(price))}
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEditingPrice(item)}
            />
          </span>
        ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (amount: string) => currency.format(Number(amount)),
    },
  ]

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
      message.success(`Invoice for ${order.order_number} downloaded`)
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
              <Descriptions.Item label="Discount">
                {liveOrder.discount}%
              </Descriptions.Item>
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
