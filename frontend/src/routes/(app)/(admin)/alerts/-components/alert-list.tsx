import { useMemo, useState, useRef, useEffect } from 'react'
import type { LoginActivity } from '@/api/admin/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ShieldAlert,
  ShieldCheck,
  Monitor,
  Smartphone,
  Copy,
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDevice(userAgent: string): { name: string; isMobile: boolean } {
  if (!userAgent) return { name: 'Không xác định', isMobile: false }
  const ua = userAgent.toLowerCase()
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(ua)

  let browser = 'Trình duyệt khác'
  if (ua.includes('edg/')) browser = 'Microsoft Edge'
  else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera'
  else if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('trident') || ua.includes('msie'))
    browser = 'Internet Explorer'

  let os = ''
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac os')) os = 'macOS'
  else if (ua.includes('iphone')) os = 'iPhone'
  else if (ua.includes('ipad')) os = 'iPad'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('linux')) os = 'Linux'

  return { name: os ? `${browser} / ${os}` : browser, isMobile }
}

// ─── Columns ──────────────────────────────────────────────────────────────────

function buildColumns(): ColumnDef<LoginActivity>[] {
  return [
    {
      id: 'status',
      header: 'Trạng thái',
      size: 150,
      cell: ({ row }) =>
        row.original.isSuspicious ? (
          <Badge
            variant="outline"
            className="text-xs gap-1.5 font-medium bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 whitespace-nowrap"
          >
            <ShieldAlert className="h-3 w-3 shrink-0" />
            IP / Thiết bị lạ
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs gap-1.5 font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800 whitespace-nowrap"
          >
            <ShieldCheck className="h-3 w-3 shrink-0" />
            Bình thường
          </Badge>
        ),
    },
    {
      id: 'user',
      header: 'Người dùng',
      size: 220,
      cell: ({ row }) => {
        const u = row.original.user
        const initials = u.name.slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 shrink-0">
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
      id: 'ip',
      header: 'Địa chỉ IP',
      size: 150,
      cell: ({ row }) => (
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {row.original.ipAddress || '—'}
        </code>
      ),
    },
    {
      id: 'device',
      header: 'Thiết bị / Trình duyệt',
      cell: ({ row }) => {
        const { name, isMobile } = parseDevice(row.original.userAgent)
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            {isMobile ? (
              <Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs truncate" title={row.original.userAgent}>
              {name}
            </span>
          </div>
        )
      },
    },
    {
      id: 'createdAt',
      header: 'Thời gian đăng nhập',
      size: 180,
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt)
        const timeAgo = formatDistanceToNow(createdAt, {
          addSuffix: true,
          locale: vi,
        })
        return (
          <div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo}
            </p>
            <p
              className="text-[10px] text-muted-foreground/60 whitespace-nowrap"
              title={row.original.createdAt}
            >
              {formatDate(row.original.createdAt)}
            </p>
          </div>
        )
      },
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LoginActivityTableProps {
  activities: LoginActivity[]
}

export function LoginActivityTable({ activities }: LoginActivityTableProps) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const columns = useMemo(() => buildColumns(), [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setSelectedRowId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div ref={tableRef} className="rounded-md h-full pr-3.5">
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <ContextMenu key={row.id}>
                <ContextMenuTrigger
                  render={
                    <TableRow
                      data-state={
                        selectedRowId === row.id ? 'selected' : undefined
                      }
                      className={cn(
                        'cursor-pointer',
                        row.original.isSuspicious &&
                          'border-l-2 border-l-red-400 bg-red-50/30 dark:bg-red-950/10',
                      )}
                      onClick={() =>
                        setSelectedRowId(
                          selectedRowId === row.id ? null : row.id,
                        )
                      }
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
                <ContextMenuContent className="w-52">
                  <ContextMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(row.original.ipAddress)
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép địa chỉ IP
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(row.original.user.email)
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép email người dùng
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
                Không có dữ liệu đăng nhập.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
    </div>
  )
}
