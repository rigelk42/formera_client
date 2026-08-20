import {
  Button,
  Descriptions,
  Empty,
  Modal,
  Popconfirm,
  Spin,
  Table,
  Tag,
  type TableColumnsType,
} from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useCustomer } from './useCustomer'
import { useDeleteAddress } from './useDeleteAddress'
import { useDeleteCustomer } from './useDeleteCustomer'
import type { Address } from './types'
import type { Order, OrderStatus } from '../orders/types'

const statusColor: Record<OrderStatus, string> = {
  paid: 'blue',
  cash_pickup: 'green',
  referral: 'purple',
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function buildAddressColumns(
  onDelete: (address: Address) => void,
  deletingId: number | undefined,
): TableColumnsType<Address> {
  return [
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
    {
      title: '',
      key: 'actions',
      render: (_, address) => (
        <Popconfirm
          title="Delete this address?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(address)}
        >
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            loading={deletingId === address.id}
          />
        </Popconfirm>
      ),
    },
  ]
}

const orderColumns: TableColumnsType<Order> = [
  { title: 'Order #', dataIndex: 'order_number', key: 'order_number' },
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
    render: (status: OrderStatus) => (
      <Tag color={statusColor[status]}>{status.replace('_', ' ')}</Tag>
    ),
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
  const deleteCustomer = useDeleteCustomer()
  const deleteAddress = useDeleteAddress()

  const handleDeleteCustomer = async () => {
    if (!customer) return
    await deleteCustomer.mutateAsync(customer.id)
    onClose()
  }

  const handleDeleteAddress = (address: Address) => {
    if (!customer) return
    deleteAddress.mutate({ customerId: customer.id, addressId: address.id })
  }

  return (
    <Modal
      title={
        customer ? (
          <div className="flex items-center gap-3">
            <span>
              {customer.first_name} {customer.last_name}
            </span>
            <Popconfirm
              title="Delete this customer?"
              description="Their order history is kept -- this only removes them from the customer list."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={handleDeleteCustomer}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deleteCustomer.isPending}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        ) : (
          'Customer'
        )
      }
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
            columns={buildAddressColumns(
              handleDeleteAddress,
              deleteAddress.isPending ? deleteAddress.variables?.addressId : undefined,
            )}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content', y: 240 }}
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
            scroll={{ x: 'max-content', y: 240 }}
            locale={{ emptyText: <Empty description="No past orders" /> }}
          />
        </>
      )}
    </Modal>
  )
}
