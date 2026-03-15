import { useDetailBar } from '../route'
import { FileText, Calendar, HardDrive } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatFileSize, getFileIcon } from '@/lib/file-utils'
import { cn } from '@/lib/utils'

export function DetailBar() {
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
  const ownerInitials = (selectedFile.owner.name || selectedFile.owner.email)
    .substring(0, 2)
    .toUpperCase()

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
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Loại tệp</p>
              <p
                className="text-sm truncate max-w-45"
                title={selectedFile.mimeType}
              >
                {selectedFile.mimeType}
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
            <AvatarFallback className="text-xs">{ownerInitials}</AvatarFallback>
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

      {selectedFile.shares && selectedFile.shares.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Đã chia sẻ ({selectedFile.shares.length})
            </h3>
            <div className="space-y-2">
              {selectedFile.shares.map((share) => {
                const initials = (share.sender.name || share.sender.email)
                  .substring(0, 2)
                  .toUpperCase()
                return (
                  <div key={share.id} className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {share.sender.name || share.sender.email}
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
