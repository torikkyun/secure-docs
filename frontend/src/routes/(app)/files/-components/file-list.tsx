import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import {
  FileText,
  Image,
  File,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
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

interface FileListProps {
  files: FileItem[]
  onShare: (file: FileItem) => void
  onDownload: (file: FileItem) => void
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const columns: ColumnDef<FileItem>[] = [
  {
    accessorKey: 'filename',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Tên
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const file = row.original
      const FileIcon = getFileIcon(file.mimeType)

      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center shrink-0">
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium truncate" title={file.filename}>
            {file.filename}
          </span>
        </div>
      )
    },
  },
  {
    id: 'owner',
    header: 'Chủ sở hữu',
    cell: ({ row }) => {
      const file = row.original
      const person = file.isOwner ? file.owner : (file.sharedBy ?? file.owner)
      const displayName = file.isOwner ? 'Tôi' : person?.name || '—'
      const initials = person?.name
        ? person.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : (person?.email?.substring(0, 2).toUpperCase() ?? '?')

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={person?.avatar} alt={person?.name ?? ''} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{displayName}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Ngày tải lên
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue('createdAt'))}
        </div>
      )
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium"
        >
          Kích thước
          <ArrowUpDown className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatFileSize(Number(row.getValue('size')))}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const file = row.original
      const { onShare, onDownload } = table.options.meta as {
        onShare: (file: FileItem) => void
        onDownload: (file: FileItem) => void
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0')}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onDownload(file)}>
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(file)}>
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled
                onClick={() => toast.info('Tính năng đang phát triển')}
              >
                Đổi tên
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                onClick={() => toast.info('Tính năng đang phát triển')}
              >
                Di chuyển
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled
                className="text-destructive"
                onClick={() => toast.info('Tính năng đang phát triển')}
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function FileList({ files, onShare, onDownload }: FileListProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: files,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    meta: { onShare, onDownload },
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Không có tệp nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
