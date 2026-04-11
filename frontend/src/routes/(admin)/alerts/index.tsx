import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getAlertsFn, resolveAlertFn } from '@/api/admin/functions'
import {
  AlertLevel,
  AlertType,
  AnomalyAlert,
  AlertsResult,
} from '@/api/admin/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const Route = createFileRoute('/(admin)/alerts/')({
  component: AdminAlertsPage,
})

const LEVEL_CONFIG: Record<
  AlertLevel,
  { label: string; variant: string; icon: typeof AlertTriangle }
> = {
  WARNING: {
    label: 'Cảnh báo',
    variant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertTriangle,
  },
  ALERT: {
    label: 'Nghiêm trọng',
    variant: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertOctagon,
  },
  CRITICAL: {
    label: 'Cực kỳ nghiêm trọng',
    variant: 'bg-red-100 text-red-800 border-red-200',
    icon: ShieldAlert,
  },
}

const TYPE_CONFIG: Record<AlertType, { label: string }> = {
  STATISTICAL: { label: 'Thống kê (Z-Score)' },
  POLICY: { label: 'Vi phạm quy tắc' },
}

function LevelBadge({ level }: { level: AlertLevel }) {
  const cfg = LEVEL_CONFIG[level]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
        cfg.variant,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function AdminAlertsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState<'all' | AlertLevel>('all')
  const [type, setType] = useState<'all' | AlertType>('all')
  const [unresolvedOnly, setUnresolvedOnly] = useState(false)

  const { data, isLoading } = useQuery<AlertsResult>({
    queryKey: ['admin', 'alerts', page, level, type, unresolvedOnly],
    queryFn: () =>
      getAlertsFn({
        data: {
          page,
          limit: 20,
          level: level === 'all' ? undefined : level,
          type: type === 'all' ? undefined : type,
          isResolved: unresolvedOnly ? false : undefined,
        },
      }) as Promise<AlertsResult>,
  })

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) =>
      resolveAlertFn({ data: { alertId, isResolved: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'unresolved-alert-count'],
      })
      toast.success('Đã đánh dấu đã xử lý')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const alerts = data?.alerts ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cảnh báo bất thường
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Phát hiện bất thường tự động bằng Z-Score và quy tắc chính sách
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Lọc:
        </div>
        <Select
          value={level}
          onValueChange={(v) => {
            setLevel((v ?? 'all') as typeof level)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            <SelectItem value="WARNING">Cảnh báo</SelectItem>
            <SelectItem value="ALERT">Nghiêm trọng</SelectItem>
            <SelectItem value="CRITICAL">Cực kỳ nghiêm trọng</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(v) => {
            setType((v ?? 'all') as typeof type)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-45 h-9">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="STATISTICAL">Thống kê (Z-Score)</SelectItem>
            <SelectItem value="POLICY">Vi phạm quy tắc</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={unresolvedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setUnresolvedOnly((v) => !v)
            setPage(1)
          }}
        >
          Chưa xử lý
        </Button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {isLoading && (
          <p className="text-muted-foreground text-center py-10">Đang tải...</p>
        )}
        {!isLoading &&
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => resolveMutation.mutate(alert.id)}
              isPending={resolveMutation.isPending}
            />
          ))}
        {!isLoading && alerts.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
            <CheckCircle2 className="h-10 w-10 opacity-30" />
            <p className="text-sm">Không có cảnh báo nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng {data.total} cảnh báo — Trang {data.page} / {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCard({
  alert,
  onResolve,
  isPending,
}: {
  alert: AnomalyAlert
  onResolve: () => void
  isPending: boolean
}) {
  return (
    <div
      className={cn(
        'border rounded-lg p-4 space-y-3 transition-opacity',
        alert.isResolved && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 mt-0.5">
            <AvatarImage src={alert.user.avatar} />
            <AvatarFallback>
              {alert.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{alert.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {alert.user.email}
              </span>
            </div>
            <p className="text-sm">{alert.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={alert.level} />
              <Badge variant="outline" className="text-xs">
                {TYPE_CONFIG[alert.type].label}
              </Badge>
              {alert.isResolved && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Đã xử lý
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm', {
              locale: vi,
            })}
          </span>
          {!alert.isResolved && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={onResolve}
              disabled={isPending}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đánh dấu xử lý
            </Button>
          )}
        </div>
      </div>
      {Object.keys(alert.metadata).length > 0 && (
        <div className="rounded-md bg-muted/50 p-3 text-xs font-mono overflow-x-auto">
          {JSON.stringify(alert.metadata, null, 2)}
        </div>
      )}
    </div>
  )
}
