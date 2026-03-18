import {
  MoreHorizontal,
  ExternalLink,
  Upload,
  Download,
  Share2,
  FileText,
  Trash2,
  ShieldOff,
  Link2,
} from 'lucide-react'
import { getFileIcon } from '@/lib/file-utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileActivity, ShareActivity } from '@/api/file-activity/types'
import React from 'react'

interface ActivityGridProps {
  activities: FileActivity[]
}

type ActionConfig = {
  icon: React.ElementType
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
}

const actionConfig: Record<string, ActionConfig> = {
  UPLOAD: {
    icon: Upload,
    label: 'Tải lên',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-t-emerald-400',
  },
  DOWNLOAD: {
    icon: Download,
    label: 'Tải xuống',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    borderClass: 'border-t-blue-400',
  },
  SHARE: {
    icon: Share2,
    label: 'Chia sẻ',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    borderClass: 'border-t-violet-400',
  },
  DELETE: {
    icon: Trash2,
    label: 'Xóa tệp',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/50',
    borderClass: 'border-t-red-400',
  },
  REVOKE_SHARE: {
    icon: ShieldOff,
    label: 'Thu hồi quyền',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 dark:bg-orange-950/50',
    borderClass: 'border-t-orange-400',
  },
}

function getConfig(action: string): ActionConfig {
  return (
    actionConfig[action] ?? {
      icon: FileText,
      label: action,
      colorClass: 'text-gray-600',
      bgClass: 'bg-gray-50 dark:bg-gray-900/50',
      borderClass: 'border-t-gray-400',
    }
  )
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}

function ActivityCard({ activity }: { activity: FileActivity }) {
  const config = getConfig(activity.action)
  const ActionIcon = config.icon
  const { Icon: FileIcon, colorClass: fileColorClass } = getFileIcon(
    activity.file?.mimeType || '',
  )

  const user = activity.user
  const initials = user.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  let shareDetails = ''
  if (activity.action === 'SHARE') {
    const a = activity as ShareActivity
    const count = a.shareCount || a.recipients?.length || 0
    if (count === 1 && a.recipients?.[0]) {
      shareDetails = `với ${a.recipients[0].name}`
    } else if (count > 0) {
      shareDetails = `với ${count} người`
    }
  }

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border-t-2 border border-border bg-card',
        'transition-all hover:shadow-md cursor-default overflow-hidden',
        config.borderClass,
      )}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              config.bgClass,
              config.colorClass,
            )}
          >
            <ActionIcon className="h-3 w-3" />
            {config.label}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-6 w-6 -mt-0.5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity',
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Mở menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {activity.blockchainTxHash ? (
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
                ) : (
                  <DropdownMenuItem disabled>
                    Không có log on-chain
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <FileIcon className={cn('h-4 w-4 shrink-0', fileColorClass)} />
          <p
            className="text-sm font-medium truncate leading-tight"
            title={activity.file?.filename}
          >
            {activity.file?.filename || 'Tệp không xác định'}
          </p>
        </div>

        {shareDetails && (
          <p className="text-xs text-muted-foreground -mt-1.5 truncate">
            {shareDetails}
          </p>
        )}

        {activity.blockchainTxHash && (
          <Badge
            variant="outline"
            className="text-[10px] h-5 w-fit px-1.5 py-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-500"
          >
            <Link2 className="h-2.5 w-2.5 mr-0.5" />
            On-chain
          </Badge>
        )}

        <div className="flex items-center justify-between pt-2.5 border-t mt-auto">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-22.5">
              {user.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(activity.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ActivityGrid({ activities }: ActivityGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
