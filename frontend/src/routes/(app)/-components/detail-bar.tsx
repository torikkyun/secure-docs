import { useDetailBar } from '../-context/detail-bar-context'
import { useRouterState } from '@tanstack/react-router'
import { FileText, Calendar, HardDrive, Shield, Flag } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatFileSize, getFileIcon } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { DetailBarUser } from './detail-bar-user'
import type { FileClassification, ContentFlag } from '@/api/file/types'

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
              src={selectedFile.owner.avatar}
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
                  const initials = (person.name || person.email)
                    .substring(0, 2)
                    .toUpperCase()
                  return (
                    <div key={person.id} className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={person.avatar} alt={person.name} />
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

export function DetailBar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const isUsersPage =
    currentPath === '/users' || currentPath.startsWith('/users/')

  if (isUsersPage) {
    return <DetailBarUser />
  }

  return <DetailBarFile />
}
