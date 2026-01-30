/**
 * Table with Actions Example
 *
 * Ví dụ về table với:
 * - Action buttons (Edit, Delete, View)
 * - Row selection
 * - Bulk actions
 * - Custom cell renderers
 */

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

type Share = {
  id: string
  filename: string
  recipient: string
  sharedAt: string
  status: 'pending' | 'accepted' | 'expired'
}

const sampleShares: Share[] = [
  {
    id: '1',
    filename: 'document.pdf',
    recipient: 'user1@example.com',
    sharedAt: '2026-01-20T10:00:00Z',
    status: 'accepted',
  },
  {
    id: '2',
    filename: 'report.xlsx',
    recipient: 'user2@example.com',
    sharedAt: '2026-01-21T11:30:00Z',
    status: 'pending',
  },
  {
    id: '3',
    filename: 'image.png',
    recipient: 'user3@example.com',
    sharedAt: '2026-01-15T14:15:00Z',
    status: 'expired',
  },
  {
    id: '4',
    filename: 'presentation.pptx',
    recipient: 'user4@example.com',
    sharedAt: '2026-01-22T09:45:00Z',
    status: 'accepted',
  },
]

const columnHelper = createColumnHelper<Share>()

export function TableWithActionsExample() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [data, setData] = useState(sampleShares)

  // Action handlers
  const handleView = (id: string) => {
    alert(`Xem chi tiết share ID: ${id}`)
  }

  const handleEdit = (id: string) => {
    alert(`Chỉnh sửa share ID: ${id}`)
  }

  const handleDelete = (id: string) => {
    if (confirm(`Bạn có chắc muốn xóa share ID: ${id}?`)) {
      setData((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mục')
      return
    }

    if (confirm(`Xóa ${selectedIds.length} mục đã chọn?`)) {
      setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      setRowSelection({})
    }
  }

  const columns = useMemo(
    () => [
      // Selection column
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
        ),
      }),

      columnHelper.accessor('filename', {
        header: 'Tên file',
        cell: (info) => (
          <span style={{ fontWeight: 500 }}>{info.getValue()}</span>
        ),
      }),

      columnHelper.accessor('recipient', {
        header: 'Người nhận',
        cell: (info) => (
          <a
            href={`mailto:${info.getValue()}`}
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            {info.getValue()}
          </a>
        ),
      }),

      columnHelper.accessor('sharedAt', {
        header: 'Ngày chia sẻ',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
      }),

      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => {
          const status = info.getValue()
          const colors = {
            pending: { bg: '#fef3c7', text: '#92400e' },
            accepted: { bg: '#d1fae5', text: '#065f46' },
            expired: { bg: '#fee2e2', text: '#991b1b' },
          }
          const labels = {
            pending: 'Chờ xác nhận',
            accepted: 'Đã chấp nhận',
            expired: 'Hết hạn',
          }

          return (
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: colors[status].bg,
                color: colors[status].text,
              }}
            >
              {labels[status]}
            </span>
          )
        },
      }),

      // Actions column
      columnHelper.display({
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => handleView(row.original.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #3b82f6',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Xem chi tiết"
            >
              👁️ Xem
            </button>
            <button
              onClick={() => handleEdit(row.original.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #f59e0b',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Chỉnh sửa"
            >
              ✏️ Sửa
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ef4444',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Xóa"
            >
              🗑️ Xóa
            </button>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  return (
    <div style={{ padding: '20px' }}>
      <h2>Table with Actions Example</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ví dụ về table với row selection, bulk actions, và custom action buttons
      </p>

      {/* Bulk Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#dbeafe',
            borderRadius: '6px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            Đã chọn {Object.keys(rowSelection).length} mục
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleBulkDelete}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              🗑️ Xóa đã chọn
            </button>
            <button
              onClick={() => setRowSelection({})}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
        }}
      >
        <thead style={{ backgroundColor: '#f3f4f6' }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #eee',
                backgroundColor: row.getIsSelected() ? '#f0f9ff' : 'white',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '12px',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Tổng số:</strong> {data.length} chia sẻ
      </div>
    </div>
  )
}
