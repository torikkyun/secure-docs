import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Share2,
  Eye,
  Info,
  UserX,
  Trash2,
} from 'lucide-react'
import { getFileIcon, formatFileSize, formatDate } from '@/lib/file-utils'
import { useState, useRef, useEffect } from 'react'
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileItem } from '@/api/file/types'
import { useDetailBar } from '@/routes/(app)/-context/detail-bar-context'

interface FileListProps {
  files: FileItem[]
  onShare: (file: FileItem) => void
  onDownload: (file: FileItem) => void
  onView: (file: FileItem) => void
  onRevokeShare: (file: FileItem) => void
  onDelete: (file: FileItem) => void
  onSelect?: (file: FileItem | null) => void
  onSortingChange?: (
    sortBy: string | undefined,
    sortOrder: 'asc' | 'desc',
  ) => void
}

const columns: ColumnDef<FileItem>[] = [
  {
    accessorKey: 'filename',
    meta: { className: 'w-1/2' },
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
    meta: { className: 'w-px' },
    enableHiding: false,
    cell: ({ row, table }) => {
      const file = row.original
      const {
        onShare,
        onDownload,
        onView,
        onRevokeShare,
        onDelete,
        onOpenDetail,
      } = table.options.meta as {
        onShare: (file: FileItem) => void
        onDownload: (file: FileItem) => void
        onView: (file: FileItem) => void
        onRevokeShare: (file: FileItem) => void
        onDelete: (file: FileItem) => void
        onSelect: (file: FileItem | null) => void
        onOpenDetail: (file: FileItem) => void
      }

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0',
              )}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-54">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onOpenDetail(file)}>
                  <Info className="h-4 w-4" />
                  Thông tin chi tiết
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => onView(file)}
                  disabled={file.mimeType !== 'application/pdf'}
                >
                  <Eye className="h-4 w-4" />
                  Xem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4" />
                  Tải xuống
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onShare(file)}
                  disabled={!file.isOwner}
                >
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => onRevokeShare(file)}
                  variant="destructive"
                  disabled={
                    !file.isOwner ||
                    !file.sharedWith ||
                    file.sharedWith.length === 0
                  }
                >
                  <UserX className="h-4 w-4" />
                  Thu hồi quyền truy cập
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(file)}
                  disabled={!file.isOwner}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function FileList({
  files,
  onShare,
  onDownload,
  onView,
  onRevokeShare,
  onDelete,
  onSelect,
  onSortingChange,
}: FileListProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const {
    isOpen: isDetailBarOpen,
    toggle: toggleDetailBar,
    setSelectedFile,
  } = useDetailBar()

  const columnVisibility: VisibilityState = isDetailBarOpen
    ? { owner: false, createdAt: false, size: false }
    : {}

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setSelectedRowId(null)
        setSelectedFile(null)
        onSelect?.(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onSelect, setSelectedFile])

  const handleRowClick = (rowId: string, file: FileItem) => {
    if (isDetailBarOpen) {
      // Detail bar is open: always update it with the clicked file (no toggle)
      setSelectedRowId(rowId)
      setSelectedFile(file)
      return
    }
    const isAlreadySelected = selectedRowId === rowId
    setSelectedRowId(isAlreadySelected ? null : rowId)
    onSelect?.(isAlreadySelected ? null : file)
  }

  const handleSortingChange = (
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    setSorting(newSorting)
    if (newSorting.length > 0) {
      onSortingChange?.(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
    } else {
      onSortingChange?.(undefined, 'desc')
    }
  }

  const handleOpenDetail = (file: FileItem) => {
    setSelectedFile(file)
    if (!isDetailBarOpen) toggleDetailBar()
    const rowId =
      table.getRowModel().rows.find((r) => r.original.id === file.id)?.id ??
      null
    setSelectedRowId(rowId)
    onSelect?.(file)
  }

  const table = useReactTable({
    data: files,
    columns,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting, columnVisibility },
    meta: {
      onShare,
      onDownload,
      onView,
      onRevokeShare,
      onDelete,
      onSelect,
      onOpenDetail: handleOpenDetail,
    },
  })

  return (
    <div ref={tableRef} className={cn('rounded-md h-full')}>
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    header.column.id === 'filename'
                      ? isDetailBarOpen
                        ? 'w-full'
                        : 'w-1/2'
                      : (header.column.columnDef.meta as { className?: string })
                          ?.className
                  }
                >
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
              <ContextMenu key={row.id}>
                <ContextMenuTrigger
                  render={
                    <TableRow
                      data-state={
                        selectedRowId === row.id ? 'selected' : undefined
                      }
                      className="cursor-pointer"
                      onClick={() => handleRowClick(row.id, row.original)}
                    />
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'filename'
                          ? isDetailBarOpen
                            ? 'w-full'
                            : 'w-1/2'
                          : (
                              cell.column.columnDef.meta as {
                                className?: string
                              }
                            )?.className
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-54">
                  <ContextMenuItem
                    onClick={() => handleOpenDetail(row.original)}
                  >
                    <Info className="h-4 w-4" />
                    Thông tin chi tiết
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => onView(row.original)}
                    disabled={row.original.mimeType !== 'application/pdf'}
                  >
                    <Eye className="h-4 w-4" />
                    Xem
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onDownload(row.original)}>
                    <Download className="h-4 w-4" />
                    Tải xuống
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => onShare(row.original)}
                    disabled={!row.original.isOwner}
                  >
                    <Share2 className="h-4 w-4" />
                    Chia sẻ
                  </ContextMenuItem>

                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => onRevokeShare(row.original)}
                    variant="destructive"
                    disabled={
                      !row.original.isOwner ||
                      !row.original.sharedWith ||
                      row.original.sharedWith.length === 0
                    }
                  >
                    <UserX className="h-4 w-4" />
                    Thu hồi quyền truy cập
                  </ContextMenuItem>
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() => onDelete(row.original)}
                    disabled={!row.original.isOwner}
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
      </table>
    </div>
  )
}
