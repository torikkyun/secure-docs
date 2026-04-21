import { useDetailBar } from '../-context/detail-bar-context'
import { Users, Calendar, FileText, Shield, Ban } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/file-utils'
import { getAvatarUrl } from '@/lib/avatar-utils'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Trưởng phòng',
  user: 'Người dùng',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  user: 'outline',
}

export function DetailBarUser() {
  const { selectedUser } = useDetailBar()

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
        <Users className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Chọn một người dùng để xem thông tin chi tiết
        </p>
      </div>
    )
  }

  const initials = (selectedUser.name || selectedUser.email)
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Avatar & name */}
      <div className="flex flex-col items-center py-6 gap-3 bg-muted/30 rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={getAvatarUrl(selectedUser.avatar)}
            alt={selectedUser.name}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-sm font-medium">{selectedUser.name}</p>
          <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={roleBadgeVariant[selectedUser.role.name] ?? 'outline'}
          >
            {roleLabels[selectedUser.role.name] ?? selectedUser.role.name}
          </Badge>
          {selectedUser.isBanned && (
            <Badge variant="destructive">Đã khóa</Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Thống kê
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Tài liệu sở hữu</p>
              <p className="text-sm">{selectedUser._count.ownedFiles} tệp</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Đã chia sẻ</p>
              <p className="text-sm">{selectedUser._count.sentShares} lần</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Dates */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Thông tin
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Ngày tạo</p>
              <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
            </div>
          </div>
          {selectedUser.isBanned && (
            <div className="flex items-start gap-2.5">
              <Ban className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <p className="text-sm text-destructive">Tài khoản bị khóa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
