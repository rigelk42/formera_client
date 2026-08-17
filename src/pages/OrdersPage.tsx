import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { OrderFormModal } from '../orders/OrderFormModal'

export function OrdersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <section className="px-5 py-3">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl! font-medium text-[var(--text-h)]">Orders</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateOpen(true)}
        >
          New order
        </Button>
      </div>

      <OrderFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  )
}
