/**
 * Basic TanStack Table Example
 *
 * Ví dụ cơ bản về cách sử dụng TanStack Table với:
 * - Column definitions
 * - Data rendering
 * - Basic styling
 */

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: string
}

const sampleData: User[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'a@example.com', role: 'Admin' },
  { id: '2', name: 'Trần Thị B', email: 'b@example.com', role: 'User' },
  { id: '3', name: 'Lê Văn C', email: 'c@example.com', role: 'User' },
  { id: '4', name: 'Phạm Thị D', email: 'd@example.com', role: 'Moderator' },
]

const columnHelper = createColumnHelper<User>()

export function BasicTableExample() {
  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Tên',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('role', {
        header: 'Vai trò',
        cell: (info) => (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor:
                info.getValue() === 'Admin'
                  ? '#fef3c7'
                  : info.getValue() === 'Moderator'
                    ? '#dbeafe'
                    : '#f3f4f6',
              fontSize: '12px',
            }}
          >
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  )

  // Create table instance
  const table = useReactTable({
    data: sampleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div style={{ padding: '20px' }}>
      <h2>Basic TanStack Table Example</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ví dụ cơ bản với column definitions và data rendering
      </p>

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
        <strong>Tổng số:</strong> {table.getRowModel().rows.length} người dùng
      </div>
    </div>
  )
}
