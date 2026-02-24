import { ShareFileModal } from './share-file-modal'
// import { DownloadFileModal } from './download-file-modal'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import { DownloadFileModal } from './download-file-modal'
import { deleteFileFn, getUserFilesFn } from '@/lib/api/files'
import { FileItem } from '@/api/file/types'

export function FilesTable() {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [fileToShare, setFileToShare] = useState<FileItem | null>(null)
  const [fileToDownload, setFileToDownload] = useState<FileItem | null>(null)

  // Query to fetch files
  const { data, isLoading, error } = useQuery({
    queryKey: ['files'],
    queryFn: () => getUserFilesFn(),
  })

  const files = data?.files || []
  const total = data?.total || 0

  // Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return deleteFileFn({ data: { fileId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
    onError: (err) => {
      alert(`Xóa thất bại: ${err.message}`)
    },
  })

  // Table Columns
  const columns = useMemo<ColumnDef<FileItem>[]>(
    () => [
      {
        accessorKey: 'filename',
        header: 'Tên File',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'size',
        header: 'Kích thước',
        cell: (info) => `${(Number(info.getValue()) / 1024).toFixed(2)} KB`,
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      {
        accessorKey: 'sharedBy',
        header: 'Người sở hữu',
        cell: ({ row }) => {
          if (row.original.isOwner)
            return <span style={{ color: 'green' }}>Tôi</span>
          return row.original.sharedBy?.name || 'Unknown'
        },
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFileToDownload(row.original)}
              style={{ color: '#28a745' }}
            >
              Download
            </button>
            {row.original.isOwner && (
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa file này?')) {
                    deleteMutation.mutate(row.original.id)
                  }
                }}
                style={{ color: 'red' }}
              >
                Xóa
              </button>
            )}
            <button
              onClick={() => {
                alert(
                  `Metadata Details:\nID: ${row.original.id}\nWrapped Key: ${row.original.wrappedAesKey}\nCreated: ${row.original.createdAt}`,
                )
              }}
            >
              Chi tiết
            </button>
            {row.original.isOwner && (
              <button
                onClick={() => setFileToShare(row.original)}
                style={{ color: '#007bff' }}
              >
                Chia sẻ
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  })

  if (isLoading) return <div>Đang tải danh sách file...</div>
  if (error) return <div>Lỗi: {error.message}</div>

  return (
    <>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #eee',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ background: '#f0f0f0' }}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '10px',
                    textAlign: 'left',
                    borderBottom: '1px solid #ccc',
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '20px', textAlign: 'center' }}
              >
                Không có file nào.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '8px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ShareFileModal
        file={fileToShare}
        isOpen={!!fileToShare}
        onClose={() => setFileToShare(null)}
      />

      <DownloadFileModal
        file={fileToDownload}
        isOpen={!!fileToDownload}
        onClose={() => setFileToDownload(null)}
      />
    </>
  )
}
