import { useState, useRef, useEffect, useMemo } from 'react'
import type { AlertLevel, AlertType, AnomalyAlert } from '@/api/admin/types'
import { buttonVariants } from '@/components/ui/button'
import { useDetailBar } from '@/routes/(app)/-context/detail-bar-context'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  MoreHorizontal,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { formatDate } from '@/lib/file-utils'
import { vi } from 'date-fns/locale/vi'
import { getAvatarUrl } from '@/lib/avatar-utils'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Config ────────────────────────────────────────────────────────────────

export const LEVEL_CONFIG: Record<
  AlertLevel,
  {
    label: string
    variant: string
    icon: typeof AlertTriangle
    rowClass: string
    dotClass: string
  }
> = {
  WARNING: {
    label: 'Cảnh báo',
    variant:
      'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
    icon: AlertTriangle,
    rowClass: 'border-l-yellow-400',
    dotClass: 'bg-yellow-400',
  },
  ALERT: {
    label: 'Nghiêm trọng',
    variant:
      'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
    icon: AlertOctagon,
    rowClass: 'border-l-orange-500',
    dotClass: 'bg-orange-500',
  },
  CRITICAL: {
    label: 'Cực kỳ nghiêm trọng',
    variant:
      'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    icon: ShieldAlert,
    rowClass: 'border-l-red-500',
    dotClass: 'bg-red-500',
  },
}

export const TYPE_CONFIG: Record<
  AlertType,
  { label: string; dotClass: string }
> = {
  STATISTICAL: { label: 'Thống kê (Z-Score)', dotClass: 'bg-blue-400' },
  POLICY: { label: 'Vi phạm quy tắc', dotClass: 'bg-purple-400' },
}

function LevelBadge({ level }: { level: AlertLevel }) {
  const cfg = LEVEL_CONFIG[level]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap',
        cfg.variant,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  )
}

interface AlertListMeta {
  onResolve: (id: string) => void
  onOpenDetail: (alert: AnomalyAlert) => void
  isResolvePending: boolean
}

function buildColumns(): ColumnDef<AnomalyAlert>[] {
  return [
    {
      id: 'level',
      header: 'Mức độ',
      size: 160,
      cell: ({ row }) => <LevelBadge level={row.original.level} />,
    },
    {
      id: 'user',
      header: 'Người dùng',
      size: 180,
      cell: ({ row }) => {
        const u = row.original.user
        const initials = u.name.slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={getAvatarUrl(u.avatar)} />
              <AvatarFallback className="text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {u.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'type',
      header: 'Loại',
      size: 170,
      cell: ({ row }) => {
        const cfg = TYPE_CONFIG[row.original.type]
        return (
          <Badge
            variant="secondary"
            className="text-xs gap-1.5 font-medium px-2 py-0.5 whitespace-nowrap"
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dotClass)}
            />
            {cfg.label}
          </Badge>
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Thời gian',
      size: 120,
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt)
        const timeAgo = formatDistanceToNow(createdAt, {
          addSuffix: true,
          locale: vi,
        })
        return (
          <span
            className="text-xs text-muted-foreground whitespace-nowrap"
            title={formatDate(row.original.createdAt)}
          >
            {timeAgo}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Trạng thái',
      size: 120,
      cell: ({ row }) =>
        row.original.isResolved ? (
          <Badge
            variant="outline"
            className="text-xs gap-1 font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800 whitespace-nowrap"
          >
            <CheckCircle2 className="h-3 w-3" />
            Đã xử lý
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs font-medium text-muted-foreground whitespace-nowrap"
          >
            Chưa xử lý
          </Badge>
        ),
    },
    {
      id: 'actions',
      size: 52,
      enableHiding: false,
      cell: ({ row, table }) => {
        const alert = row.original
        const { onResolve, onOpenDetail, isResolvePending } = table.options
          .meta as AlertListMeta
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'h-8 w-8 p-0',
                )}
              >
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onOpenDetail(alert)}>
                  <Info className="h-4 w-4" />
                  Thông tin chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onResolve(alert.id)}
                  disabled={alert.isResolved || isResolvePending}
                  className="text-green-600 focus:text-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Đánh dấu đã xử lý
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

interface AlertListProps {
  alerts: AnomalyAlert[]
  isLoading: boolean
  onResolve: (id: string) => void
  isResolvePending: boolean
}

export function AlertList({
  alerts,
  isLoading,
  onResolve,
  isResolvePending,
}: AlertListProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const {
    isOpen: isDetailBarOpen,
    toggle: toggleDetailBar,
    setSelectedAlert,
    selectedAlert,
  } = useDetailBar()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setSelectedRowId(null)
        setSelectedAlert(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setSelectedAlert])

  const handleRowClick = (alert: AnomalyAlert) => {
    if (isDetailBarOpen) {
      setSelectedRowId(alert.id)
      setSelectedAlert(alert)
      return
    }
    const isAlreadySelected = selectedRowId === alert.id
    setSelectedRowId(isAlreadySelected ? null : alert.id)
    setSelectedAlert(isAlreadySelected ? null : alert)
  }

  const handleOpenDetail = (alert: AnomalyAlert) => {
    setSelectedRowId(alert.id)
    setSelectedAlert(alert)
    if (!isDetailBarOpen) toggleDetailBar()
  }

  // columns is defined outside component — stable reference, no deps needed
  const columns = useMemo(() => buildColumns(), [])
  const table = useReactTable({
    data: alerts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onResolve,
      onOpenDetail: handleOpenDetail,
      isResolvePending,
    } as AlertListMeta,
  })

  return (
    <div ref={tableRef} className="rounded-md h-full pr-3.5">
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={
                    header.column.getSize() !== 150
                      ? { width: `${header.column.getSize()}px` }
                      : undefined
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
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Đang tải...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <ContextMenu key={row.id}>
                <ContextMenuTrigger
                  render={
                    <TableRow
                      className={cn(
                        'cursor-pointer',
                        selectedAlert?.id === row.original.id && 'bg-muted/50',
                      )}
                      onClick={() => handleRowClick(row.original)}
                    />
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onClick={() => handleOpenDetail(row.original)}
                  >
                    <Info className="h-4 w-4" />
                    Thông tin chi tiết
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => onResolve(row.original.id)}
                    disabled={row.original.isResolved || isResolvePending}
                    className="text-green-600 focus:text-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Đánh dấu đã xử lý
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                    <CheckCircle2 className="h-7 w-7 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Không có cảnh báo nào</p>
                    <p className="text-xs text-muted-foreground/70">
                      Hệ thống không phát hiện hoạt động bất thường phù hợp với
                      bộ lọc hiện tại.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
    </div>
  )
}
