import { useDetailBar } from '../-context/detail-bar-context'
import { useRouterState } from '@tanstack/react-router'
import {
  FileText,
  Calendar,
  HardDrive,
  Shield,
  Flag,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatFileSize, getFileIcon } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { DetailBarUser } from './detail-bar-user'
import type { FileClassification, ContentFlag } from '@/api/file/types'
import type { AlertLevel, AlertType } from '@/api/admin/types'
import { resolveAlertFn } from '@/api/admin/functions'
import { getAvatarUrl } from '@/lib/avatar-utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const CLASSIFICATION_CONFIG: Record<
  FileClassification,
  { label: string; className: string }
> = {
  UNCLASSIFIED: {
    label: 'Chưa phân loại',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  PUBLIC: {
    label: 'Công khai',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  INTERNAL: {
    label: 'Nội bộ',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  CONFIDENTIAL: {
    label: 'Bảo mật',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  RESTRICTED: {
    label: 'Tối mật',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

const FLAG_CONFIG: Record<ContentFlag, { label: string; className: string }> = {
  SAFE: {
    label: 'An toàn',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  SENSITIVE: {
    label: 'Nhạy cảm',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  FLAGGED: {
    label: 'Cần xem xét',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

function DetailBarFile() {
  const { selectedFile } = useDetailBar()

  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Chọn một tệp để xem thông tin chi tiết
        </p>
      </div>
    )
  }

  const { Icon: FileIcon, colorClass } = getFileIcon(selectedFile.mimeType)

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Preview */}
      <div className="flex flex-col items-center py-6 gap-3 bg-muted/30 rounded-lg">
        <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-background shadow-sm border">
          <FileIcon className={cn('h-8 w-8', colorClass)} />
        </div>
        <p className="text-sm font-medium text-center break-all px-2 leading-snug">
          {selectedFile.filename}
        </p>
      </div>

      <Separator />

      {/* Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Thông tin
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <HardDrive className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Kích thước</p>
              <p className="text-sm">
                {formatFileSize(Number(selectedFile.size))}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Ngày tải lên</p>
              <p className="text-sm">{formatDate(selectedFile.createdAt)}</p>
            </div>
          </div>
          {selectedFile.classification && (
            <div className="flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Phân loại</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] h-5 px-1.5 w-fit',
                    CLASSIFICATION_CONFIG[selectedFile.classification]
                      .className,
                  )}
                >
                  {CLASSIFICATION_CONFIG[selectedFile.classification].label}
                </Badge>
              </div>
            </div>
          )}
          {selectedFile.contentFlag && selectedFile.contentFlag !== 'SAFE' && (
            <div className="flex items-start gap-2.5">
              <Flag className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Nội dung</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] h-5 px-1.5 w-fit',
                    FLAG_CONFIG[selectedFile.contentFlag].className,
                  )}
                >
                  {FLAG_CONFIG[selectedFile.contentFlag].label}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Owner */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chủ sở hữu
        </h3>
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={getAvatarUrl(selectedFile.owner.avatar)}
              alt={selectedFile.owner.name}
            />
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedFile.isOwner
                ? 'Tôi'
                : selectedFile.owner.name || selectedFile.owner.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {selectedFile.owner.email}
            </p>
          </div>
        </div>
      </div>

      {selectedFile.isOwner &&
        selectedFile.sharedWith &&
        selectedFile.sharedWith.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Đã chia sẻ với ({selectedFile.sharedWith.length})
              </h3>
              <div className="space-y-2">
                {selectedFile.sharedWith.map((person) => {
                  const initials =
                    (person.name || person.email)
                      ?.substring(0, 2)
                      .toUpperCase() ?? '?'
                  return (
                    <div key={person.id} className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={getAvatarUrl(person.avatar)}
                          alt={person.name}
                        />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm truncate">
                          {person.name || person.email}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
    </div>
  )
}

// ─── Config shared with alert detail (duplicated locally to avoid coupling) ─

const ALERT_LEVEL_CONFIG: Record<
  AlertLevel,
  { label: string; variant: string; icon: typeof AlertTriangle }
> = {
  WARNING: {
    label: 'Cảnh báo',
    variant:
      'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800',
    icon: AlertTriangle,
  },
  ALERT: {
    label: 'Nghiêm trọng',
    variant:
      'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: 'Cực kỳ nghiêm trọng',
    variant:
      'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    icon: AlertTriangle,
  },
}

const ALERT_TYPE_CONFIG: Record<
  AlertType,
  { label: string; dotClass: string }
> = {
  STATISTICAL: { label: 'Thống kê (Z-Score)', dotClass: 'bg-blue-400' },
  POLICY: { label: 'Vi phạm quy tắc', dotClass: 'bg-purple-400' },
}

const ACTION_LABEL: Record<string, string> = {
  DOWNLOAD: 'Tải xuống',
  VIEW: 'Xem tài liệu',
  SHARE: 'Chia sẻ',
  UPLOAD: 'Tải lên',
  DELETE: 'Xóa',
  RENAME: 'Đổi tên',
  REVOKE: 'Thu hồi quyền truy cập',
}

const METADATA_LABEL: Record<string, string> = {
  action: 'Hành động bất thường',
  currentCount: 'Số lần thực hiện (trong 1 giờ)',
  zScore: 'Mức độ bất thường (Z-score)',
  mean: 'Mức trung bình mỗi giờ (30 ngày qua)',
  stdDev: 'Độ lệch chuẩn',
  downloadCount: 'Số file đã tải xuống',
  windowMinutes: 'Trong khoảng thời gian (phút)',
  accessHour: 'Giờ truy cập hệ thống',
  fileId: 'Mã định danh tài liệu',
  recipientId: 'Mã định danh người nhận',
}

function formatMetadataValue(key: string, value: unknown): string {
  if (key === 'action' && typeof value === 'string') {
    return ACTION_LABEL[value] ?? value
  }
  if (key === 'accessHour' && typeof value === 'number') {
    return `${value}:00 — ngoài giờ làm việc (07:00–19:00)`
  }
  if (key === 'windowMinutes' && typeof value === 'number') {
    return `${value} phút`
  }
  if (key === 'zScore' && typeof value === 'number') {
    const severity =
      value > 3.5 ? 'rất cao' : value > 2.5 ? 'cao' : 'trung bình'
    return `${value} (${severity})`
  }
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function DetailBarAlert() {
  const { selectedAlert, setSelectedAlert } = useDetailBar()
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) =>
      resolveAlertFn({ data: { alertId, isResolved: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'unresolved-alert-count'],
      })
      toast.success('Đã đánh dấu đã xử lý')
      // Update the selected alert in-place so the sidebar reflects resolved state
      if (selectedAlert) {
        setSelectedAlert({ ...selectedAlert, isResolved: true })
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!selectedAlert) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Chọn một cảnh báo để xem thông tin chi tiết
        </p>
      </div>
    )
  }

  const levelCfg = ALERT_LEVEL_CONFIG[selectedAlert.level]
  const typeCfg = ALERT_TYPE_CONFIG[selectedAlert.type]
  const fullDate = formatDate(selectedAlert.createdAt)
  const metadataEntries = Object.entries(selectedAlert.metadata).filter(
    ([, v]) => v !== null && v !== undefined,
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* User */}
      <div className="flex flex-col items-center py-5 gap-3 bg-muted/30 rounded-lg">
        <Avatar className="h-12 w-12 border shadow-sm">
          <AvatarImage src={getAvatarUrl(selectedAlert.user.avatar)} />
          <AvatarFallback className="text-sm font-semibold">
            {selectedAlert.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center px-2">
          <p className="text-sm font-semibold">{selectedAlert.user.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {selectedAlert.user.email}
          </p>
        </div>
      </div>

      <Separator />

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap',
            levelCfg.variant,
          )}
        >
          <levelCfg.icon className="h-3 w-3 shrink-0" />
          {levelCfg.label}
        </span>
        <Badge
          variant="secondary"
          className="text-xs gap-1.5 font-medium px-2 py-0.5"
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              typeCfg.dotClass,
            )}
          />
          {typeCfg.label}
        </Badge>
        {selectedAlert.isResolved ? (
          <Badge
            variant="outline"
            className="text-xs gap-1 font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
          >
            <CheckCircle2 className="h-3 w-3" />
            Đã xử lý
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs font-medium text-muted-foreground"
          >
            Chưa xử lý
          </Badge>
        )}
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>{fullDate}</span>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mô tả
        </h3>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {selectedAlert.description}
        </p>
      </div>

      {/* Metadata */}
      {metadataEntries.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Thông tin chi tiết
            </h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="divide-y divide-border/60">
                {metadataEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-3 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      {METADATA_LABEL[key] ?? key}
                    </span>
                    <span className="text-xs font-semibold text-foreground text-right">
                      {formatMetadataValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Resolve action */}
      {!selectedAlert.isResolved && (
        <>
          <Separator />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-medium w-full"
            onClick={() => resolveMutation.mutate(selectedAlert.id)}
            disabled={resolveMutation.isPending}
          >
            Đánh dấu đã xử lý
          </Button>
        </>
      )}
    </div>
  )
}

export function DetailBar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const isUsersPage =
    currentPath === '/users' || currentPath.startsWith('/users/')
  const isAlertsPage =
    currentPath === '/alerts' || currentPath.startsWith('/alerts/')

  if (isUsersPage) {
    return <DetailBarUser />
  }

  if (isAlertsPage) {
    return <DetailBarAlert />
  }

  return <DetailBarFile />
}
