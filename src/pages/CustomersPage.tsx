import { useState } from 'react'
import { Alert, Button, Space, Table, type TableColumnsType } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { CustomerDetailModal } from '../customers/CustomerDetailModal'
import { CustomerFormModal } from '../customers/CustomerFormModal'
import { useCustomers } from '../customers/useCustomers'
import type { Customer } from '../customers/types'
import { getColumnSearchProps } from '../lib/columnSearch'

const customerName = (customer: Customer) =>
  `${customer.first_name} ${customer.last_name}`

const columns: TableColumnsType<Customer> = [
  {
    title: 'Name',
    key: 'name',
    sorter: (a, b) => customerName(a).localeCompare(customerName(b)),
    render: (_, customer) => customerName(customer),
    ...getColumnSearchProps(customerName, 'name'),
  },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
]

export function CustomersPage() {
  const [cursor, setCursor] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, isPending, isFetching, isError } = useCustomers(cursor)

  return (
    <section className="px-5 py-3">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl! font-medium text-[var(--text-h)]">Customers</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          New customer
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load customers"
          showIcon
          className="mb-4"
        />
      )}

      <Table<Customer>
        rowKey="id"
        loading={isPending}
        dataSource={data?.results ?? []}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
        onRow={(customer) => ({
          onClick: () => setSelectedCustomerId(customer.id),
          className: 'cursor-pointer',
        })}
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

      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />

      <CustomerFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  )
}
