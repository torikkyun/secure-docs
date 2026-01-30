/**
 * Advanced TanStack Table Example
 *
 * Ví dụ nâng cao với:
 * - Sorting (sắp xếp)
 * - Filtering (lọc)
 * - Pagination (phân trang)
 * - Column visibility toggle
 */

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

type File = {
  id: string
  filename: string
  size: number
  mimeType: string
  createdAt: string
  owner: string
}

const sampleFiles: File[] = [
  {
    id: '1',
    filename: 'document.pdf',
    size: 2048576,
    mimeType: 'application/pdf',
    createdAt: '2026-01-20T10:00:00Z',
    owner: 'Nguyễn Văn A',
  },
  {
    id: '2',
    filename: 'image.png',
    size: 512000,
    mimeType: 'image/png',
    createdAt: '2026-01-21T11:30:00Z',
    owner: 'Trần Thị B',
  },
  {
    id: '3',
    filename: 'report.xlsx',
    size: 1024000,
    mimeType: 'application/vnd.ms-excel',
    createdAt: '2026-01-22T14:15:00Z',
    owner: 'Lê Văn C',
  },
  {
    id: '4',
    filename: 'presentation.pptx',
    size: 4096000,
    mimeType: 'application/vnd.ms-powerpoint',
    createdAt: '2026-01-23T09:45:00Z',
    owner: 'Phạm Thị D',
  },
  {
    id: '5',
    filename: 'video.mp4',
    size: 10240000,
    mimeType: 'video/mp4',
    createdAt: '2026-01-24T16:20:00Z',
    owner: 'Hoàng Văn E',
  },
  {
    id: '6',
    filename: 'audio.mp3',
    size: 3072000,
    mimeType: 'audio/mpeg',
    createdAt: '2026-01-25T13:00:00Z',
    owner: 'Vũ Thị F',
  },
]

const columnHelper = createColumnHelper<File>()

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdvancedTableExample() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Define columns with sorting and filtering
  const columns = useMemo(
    () => [
      columnHelper.accessor('filename', {
        header: 'Tên file',
        cell: (info) => (
          <span style={{ fontWeight: 500 }}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('size', {
        header: 'Kích thước',
        cell: (info) => formatFileSize(info.getValue()),
      }),
      columnHelper.accessor('mimeType', {
        header: 'Loại file',
        cell: (info) => (
          <code
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              backgroundColor: '#f3f4f6',
              borderRadius: '3px',
            }}
          >
            {info.getValue()}
          </code>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Ngày tạo',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor('owner', {
        header: 'Chủ sở hữu',
        cell: (info) => info.getValue(),
      }),
    ],
    [],
  )

  // Create table instance with advanced features
  const table = useReactTable({
    data: sampleFiles,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div style={{ padding: '20px' }}>
      <h2>Advanced TanStack Table Example</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ví dụ nâng cao với sorting, filtering, pagination, và column visibility
      </p>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap',
        }}
      >
        {/* Global Filter */}
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm..."
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: '1',
            minWidth: '200px',
          }}
        />

        {/* Column Visibility Toggle */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {table.getAllLeafColumns().map((column) => (
            <label
              key={column.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
              {column.id}
            </label>
          ))}
        </div>
      </div>

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
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
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

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '15px',
          fontSize: '14px',
        }}
      >
        <div style={{ color: '#666' }}>
          Hiển thị{' '}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{' '}
          -{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{' '}
          trong tổng số {table.getFilteredRowModel().rows.length} kết quả
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
              backgroundColor: 'white',
            }}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
              backgroundColor: 'white',
            }}
          >
            {'<'}
          </button>
          <span style={{ padding: '6px 12px' }}>
            Trang {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
              backgroundColor: 'white',
            }}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
              backgroundColor: 'white',
            }}
          >
            {'>>'}
          </button>
        </div>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          {[5, 10, 20, 30].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Hiển thị {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
