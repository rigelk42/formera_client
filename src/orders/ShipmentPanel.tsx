import { useState } from 'react'
import {
  Button,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
} from 'antd'
import { PrinterOutlined, ReloadOutlined } from '@ant-design/icons'
import { ApiError } from '../lib/api'
import { useCarriers } from './useCarriers'
import { useCreateShipment, useRefreshShipment, useVoidShipment } from './useShipment'
import type { CreateShipmentInput } from './api'
import type { Order, ShippingStatus } from './types'

const shippingStatusColor: Record<ShippingStatus, string> = {
  not_shipped: 'default',
  label_created: 'blue',
  in_transit: 'geekblue',
  delivered: 'green',
  exception: 'red',
  voided: 'default',
}

// Pre-filled default for a typical small box -- editable per order, see
// the plan's "default package" decision.
const DEFAULT_PACKAGE = { weight_oz: 12, length: 6, width: 4, height: 4 }

interface ShipmentFormValues {
  carrier_id: string
  service_code: string
  weight_oz: number
  length: number
  width: number
  height: number
}

interface ShipmentPanelProps {
  order: Order
  onUpdated: (order: Order) => void
}

export function ShipmentPanel({ order, onUpdated }: ShipmentPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [form] = Form.useForm<ShipmentFormValues>()
  const carrierId = Form.useWatch('carrier_id', form)

  const { data: carriersData, isPending: carriersLoading } = useCarriers(showForm)
  const carriers = carriersData?.carriers ?? []
  const selectedCarrier = carriers.find((c) => c.carrier_id === carrierId)

  const createShipment = useCreateShipment()
  const refreshShipment = useRefreshShipment()
  const voidShipment = useVoidShipment()

  const handleCreate = async (values: ShipmentFormValues) => {
    const carrier = carriers.find((c) => c.carrier_id === values.carrier_id)
    const input: CreateShipmentInput = {
      carrier_id: values.carrier_id,
      carrier_name: carrier?.friendly_name ?? values.carrier_id,
      service_code: values.service_code,
      weight_oz: values.weight_oz,
      length: values.length,
      width: values.width,
      height: values.height,
    }
    try {
      const updated = await createShipment.mutateAsync({ orderId: order.id, input })
      onUpdated(updated)
      setShowForm(false)
      message.success(`Label created -- tracking ${updated.tracking_number}`)
    } catch (err) {
      message.error(
        err instanceof ApiError ? err.message : 'Failed to create shipment.',
      )
    }
  }

  const handleRefresh = async () => {
    try {
      const updated = await refreshShipment.mutateAsync(order.id)
      onUpdated(updated)
      message.success(
        `Tracking refreshed -- ${updated.shipping_status.replace('_', ' ')}`,
      )
    } catch (err) {
      message.error(
        err instanceof ApiError ? err.message : 'Failed to refresh tracking.',
      )
    }
  }

  const handleVoid = async () => {
    try {
      const updated = await voidShipment.mutateAsync(order.id)
      onUpdated(updated)
      message.success('Shipment voided.')
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : 'Failed to void shipment.')
    }
  }

  // A voided label frees the order up for a new one, same as never having
  // shipped -- without this, voiding was a dead end: the shipped-state
  // view below has no path back to the create-shipment form.
  const canCreateShipment =
    order.shipping_status === 'not_shipped' || order.shipping_status === 'voided'

  if (canCreateShipment && showForm) {
    return (
      <Form<ShipmentFormValues>
        form={form}
        layout="vertical"
        initialValues={DEFAULT_PACKAGE}
        onFinish={handleCreate}
        className="rounded-md border border-[var(--border)] p-4"
      >
        <p className="mb-3 text-sm text-[var(--text)]">
          This purchases a real, live label from your ShipStation account -- double
          check the carrier, service, and package details below.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Form.Item
            label="Carrier"
            name="carrier_id"
            rules={[{ required: true, message: 'Select a carrier' }]}
            className="flex-1"
          >
            <Select
              placeholder="Select a carrier"
              loading={carriersLoading}
              options={carriers.map((c) => ({
                value: c.carrier_id,
                label: c.friendly_name,
              }))}
              onChange={() => form.setFieldValue('service_code', undefined)}
            />
          </Form.Item>
          <Form.Item
            label="Service"
            name="service_code"
            rules={[{ required: true, message: 'Select a service' }]}
            className="flex-1"
          >
            <Select
              placeholder="Select a service"
              disabled={!selectedCarrier}
              options={(selectedCarrier?.services ?? []).map((s) => ({
                value: s.service_code,
                label: s.name,
              }))}
            />
          </Form.Item>
        </div>
        <div className="flex flex-wrap gap-3">
          <Form.Item label="Weight (oz)" name="weight_oz" rules={[{ required: true }]}>
            <InputNumber min={0.1} step={1} />
          </Form.Item>
          <Form.Item label="Length (in)" name="length" rules={[{ required: true }]}>
            <InputNumber min={0.1} step={1} />
          </Form.Item>
          <Form.Item label="Width (in)" name="width" rules={[{ required: true }]}>
            <InputNumber min={0.1} step={1} />
          </Form.Item>
          <Form.Item label="Height (in)" name="height" rules={[{ required: true }]}>
            <InputNumber min={0.1} step={1} />
          </Form.Item>
        </div>
        <Space>
          <Button type="primary" htmlType="submit" loading={createShipment.isPending}>
            Purchase Label
          </Button>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
        </Space>
      </Form>
    )
  }

  if (order.shipping_status === 'not_shipped') {
    return (
      <Button onClick={() => setShowForm(true)} disabled={!order.shipping_address}>
        {order.shipping_address
          ? 'Create Shipment'
          : 'Add a shipping address to create a shipment'}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag color={shippingStatusColor[order.shipping_status]}>
        {order.shipping_status.replace('_', ' ')}
      </Tag>
      <span className="text-sm text-[var(--text)]">
        {order.carrier_name} -- {order.service_code}
      </span>
      {order.tracking_number && (
        <span className="text-sm text-[var(--text)]">
          Tracking: {order.tracking_number}
        </span>
      )}
      {order.label_url && (
        <Button
          size="small"
          icon={<PrinterOutlined />}
          onClick={() => window.open(order.label_url, '_blank', 'noopener,noreferrer')}
        >
          Print Label
        </Button>
      )}
      {order.shipping_status === 'voided' ? (
        <Button
          size="small"
          onClick={() => setShowForm(true)}
          disabled={!order.shipping_address}
        >
          {order.shipping_address
            ? 'Create New Shipment'
            : 'Add a shipping address to create a shipment'}
        </Button>
      ) : (
        <>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={refreshShipment.isPending}
            onClick={handleRefresh}
          >
            Refresh Tracking
          </Button>
          <Popconfirm
            title="Void this shipment?"
            description="This cancels the live label with the carrier and cannot be undone."
            okText="Void"
            okButtonProps={{ danger: true }}
            onConfirm={handleVoid}
          >
            <Button size="small" danger loading={voidShipment.isPending}>
              Void Shipment
            </Button>
          </Popconfirm>
        </>
      )}
    </div>
  )
}
