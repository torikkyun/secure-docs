import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Upload,
  Download,
  Share2,
  FileText,
  MoreHorizontal,
  ExternalLink,
  Clock,
  User,
  Activity,
} from 'lucide-react'
import {
  FileActivity,
  ShareActivity,
  UploadActivity,
  DownloadActivity,
} from '@/api/file-activity/types'

function formatTimeAgo(timestamp: string) {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMs = now.getTime() - activityTime.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  return `${diffInDays} ngày trước`
}

interface ActivityFeedProps {
  activities: FileActivity[]
  isLoading?: boolean
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return Upload
      case 'DOWNLOAD':
        return Download
      case 'SHARE':
        return Share2
      default:
        return FileText
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'UPLOAD':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'DOWNLOAD':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
      case 'SHARE':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900'
    }
  }

  const getActionDescription = (activity: FileActivity) => {
    switch (activity.action) {
      case 'UPLOAD': {
        const a = activity as UploadActivity
        return `đã tải lên "${a.filename || a.file.filename}"`
      }
      case 'DOWNLOAD': {
        const a = activity as DownloadActivity
        return `đã tải xuống "${a.filename || a.file.filename}"`
      }
      case 'SHARE': {
        const a = activity as ShareActivity
        const count = a.shareCount || a.recipients?.length || 0
        if (count === 1 && a.recipients?.[0]) {
          return `đã chia sẻ "${a.file.filename}" với ${a.recipients[0].name}`
        }
        return `đã chia sẻ "${a.file.filename}" với ${count} người`
      }
      default:
        return `${activity.action.toLowerCase()} "${activity.file.filename}"`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-lg border bg-card animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted/30 p-5 rounded-full mb-4">
          <Activity className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="font-medium text-muted-foreground">
          Không có hoạt động nào
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Thử thay đổi bộ lọc tìm kiếm
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const ActionIcon = getActionIcon(activity.action)
        const actionColor = getActionColor(activity.action)
        const description = getActionDescription(activity)

        return (
          <div
            key={activity.id}
            className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* User Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback>
                {activity.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Action Header */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <div
                      className={`p-1.5 rounded-full shrink-0 ${actionColor}`}
                    >
                      <ActionIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">
                      {activity.user.name}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.action.toLowerCase()}
                    </Badge>
                    {activity.blockchainTxHash && (
                      <Badge variant="secondary" className="text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        On-chain
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-2">
                    {description}
                  </p>

                  {/* Recipients (for SHARE actions) */}
                  {activity.action === 'SHARE' &&
                    (activity as ShareActivity).recipients?.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        {(activity as ShareActivity).recipients
                          .slice(0, 3)
                          .map((r) => (
                            <span
                              key={r.id}
                              className="text-xs bg-muted px-1.5 py-0.5 rounded"
                            >
                              {r.name}
                            </span>
                          ))}
                        {(activity as ShareActivity).recipients.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(activity as ShareActivity).recipients.length - 3}{' '}
                            người khác
                          </span>
                        )}
                      </div>
                    )}

                  {/* Timestamp and IP */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                    {activity.ipAddress && (
                      <span>IP: {activity.ipAddress}</span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {activity.blockchainTxHash && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(
                              `https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`,
                              '_blank',
                            )
                          }
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Xem trên Etherscan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(activity.id)}
                    >
                      Sao chép ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
