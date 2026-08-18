import { Button, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import type { TableColumnType } from 'antd'

export function getColumnSearchProps<T>(
  getValue: (record: T) => string,
  label: string,
): TableColumnType<T> {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: FilterDropdownProps) => (
      <div className="flex flex-col gap-3 p-2" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          autoFocus
          placeholder={`Search ${label}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
        />
        <Space>
          <Button
            type="primary"
            size="small"
            className="w-24"
            onClick={() => confirm()}
          >
            Search
          </Button>
          <Button
            size="small"
            className="w-24"
            onClick={() => {
              clearFilters?.()
              confirm()
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      // Header background is the accent blue, so the active state needs a
      // color that still contrasts against it -- reuses the same red as
      // the active nav link rather than the (now invisible) accent blue.
      <SearchOutlined style={filtered ? { color: 'var(--logo-red)' } : undefined} />
    ),
    onFilter: (value, record) =>
      getValue(record).toLowerCase().includes(String(value).toLowerCase()),
  }
}
