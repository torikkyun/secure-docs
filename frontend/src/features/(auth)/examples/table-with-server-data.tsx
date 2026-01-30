/**
 * Table with Server Data Example
 *
 * Ví dụ về table với:
 * - Server-side data fetching (TanStack Query)
 * - Loading states
 * - Error handling
 * - Refetch và invalidation
 * - Server-side pagination
 */

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

type ApiFile = {
  id: string
  filename: string
  mimeType: string
  size: string
  createdAt: string
}

// Simulated API functions (replace with real API calls)
const fetchFiles = async (
  page: number = 1,
): Promise<{ files: ApiFile[]; total: number }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data
  const allFiles: ApiFile[] = Array.from({ length: 25 }, (_, i) => ({
    id: `file-${i + 1}`,
    filename: `document-${i + 1}.pdf`,
    mimeType: 'application/pdf',
    size: `${Math.floor(Math.random() * 5000) + 100} KB`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }))

  const pageSize = 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    files: allFiles.slice(start, end),
    total: allFiles.length,
  }
}

const deleteFile = async (fileId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log('Deleted file:', fileId)
}

const columnHelper = createColumnHelper<ApiFile>()

export function TableWithServerDataExample() {
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch files query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['files', currentPage],
    queryFn: () => fetchFiles(currentPage),
    staleTime: 5000, // Data stays fresh for 5 seconds
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['files'] })
      alert('Xóa file thành công!')
    },
    onError: (error: Error) => {
      alert(`Lỗi khi xóa: ${error.message}`)
    },
  })

  const handleDelete = (fileId: string) => {
    if (confirm('Bạn có chắc muốn xóa file này?')) {
      deleteMutation.mutate(fileId)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('filename', {
        header: 'Tên file',
        cell: (info) => (
          <span style={{ fontWeight: 500 }}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('mimeType', {
        header: 'Loại',
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
      columnHelper.accessor('size', {
        header: 'Kích thước',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Ngày tạo',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteMutation.isPending}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #ef4444',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderRadius: '4px',
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: deleteMutation.isPending ? 0.6 : 1,
            }}
          >
            {deleteMutation.isPending ? '⏳' : '🗑️'} Xóa
          </button>
        ),
      }),
    ],
    [deleteMutation.isPending],
  )

  const table = useReactTable({
    data: data?.files ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ marginTop: '10px', color: '#666' }}>Đang tải dữ liệu...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          margin: '20px',
        }}
      >
        <h3 style={{ color: '#991b1b' }}>❌ Lỗi khi tải dữ liệu</h3>
        <p style={{ color: '#7f1d1d' }}>
          {error instanceof Error
            ? error.message
            : 'Đã xảy ra lỗi không xác định'}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔄 Thử lại
        </button>
      </div>
    )
  }

  const totalPages = Math.ceil((data?.total ?? 0) / 10)

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Table with Server Data Example</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Ví dụ với TanStack Query, loading states, và server-side pagination
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          🔄 Làm mới
        </button>
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

      {/* Server-side Pagination */}
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
          Tổng số: <strong>{data?.total ?? 0}</strong> files
        </div>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              backgroundColor: 'white',
            }}
          >
            {'<<'}
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              backgroundColor: 'white',
            }}
          >
            {'<'}
          </button>
          <span style={{ padding: '6px 12px' }}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: 'white',
            }}
          >
            {'>'}
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: 'white',
            }}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  )
}
