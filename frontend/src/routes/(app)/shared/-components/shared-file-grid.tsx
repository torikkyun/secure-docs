import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Download } from 'lucide-react'
import { getFileIcon, formatFileSize, formatDate } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileItem } from '@/api/file/types'

interface SharedFileListProps {
  files: FileItem[]
  onDownload: (file: FileItem) => void
}

const columns: ColumnDef<FileItem>[] = [
  {
    accessorKey: 'filename',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Tên
        <ArrowUpDown className="ml-2 h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const file = row.original
      const { Icon: FileIcon, colorClass } = getFileIcon(file.mimeType)
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center shrink-0">
            <FileIcon className={cn('h-4 w-4', colorClass)} />
          </div>
          <span className="font-medium truncate max-w-xs" title={file.filename}>
            {file.filename}
          </span>
        </div>
      )
    },
  },
  {
    id: 'sharedBy',
    header: 'Người chia sẻ',
    cell: ({ row }) => {
      const person = row.original.sharedBy
      if (!person)
        return <span className="text-sm text-muted-foreground">—</span>
      const initials = person.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{person.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Ngày chia sẻ
        <ArrowUpDown className="ml-2 h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatDate(row.getValue('createdAt'))}
      </div>
    ),
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Kích cỡ tệp
        <ArrowUpDown className="ml-2 h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {formatFileSize(Number(row.getValue('size')))}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const file = row.original
      const { onDownload } = table.options.meta as {
        onDownload: (file: FileItem) => void
      }
      return (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(file)
          }}
        >
          <span className="sr-only">Tải xuống</span>
          <Download className="h-4 w-4" />
        </Button>
      )
    },
  },
]

export function SharedFileGrid({ files, onDownload }: SharedFileListProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: files,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    meta: { onDownload },
  })

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
