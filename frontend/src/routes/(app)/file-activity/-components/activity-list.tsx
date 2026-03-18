import {
  ExternalLink,
  MoreHorizontal,
  Upload,
  Download,
  Share2,
  FileText,
  Trash2,
  ShieldOff,
  Link2,
} from 'lucide-react'
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
import { getFileIcon } from '@/lib/file-utils'
import { FileActivity, ShareActivity } from '@/api/file-activity/types'

interface ActivityListProps {
  activities: FileActivity[]
}

type ActionConfig = {
  icon: React.ElementType
  label: string
  colorClass: string
  bgClass: string
}

const actionConfig: Record<string, ActionConfig> = {
  UPLOAD: {
    icon: Upload,
    label: 'Tải lên',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  DOWNLOAD: {
    icon: Download,
    label: 'Tải xuống',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
  },
  SHARE: {
    icon: Share2,
    label: 'Chia sẻ',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
  },
  DELETE: {
    icon: Trash2,
    label: 'Xóa tệp',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/50',
  },
  REVOKE_SHARE: {
    icon: ShieldOff,
    label: 'Thu hồi quyền',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 dark:bg-orange-950/50',
  },
}

function getConfig(action: string): ActionConfig {
  return (
    actionConfig[action] ?? {
      icon: FileText,
      label: action,
      colorClass: 'text-gray-600',
      bgClass: 'bg-gray-50 dark:bg-gray-900/50',
    }
  )
}

function groupByDate(activities: FileActivity[]) {
  const map = new Map<string, FileActivity[]>()
  for (const a of activities) {
    const key = new Date(a.createdAt).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(a)
  }

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  return Array.from(map.entries()).map(([key, acts]) => ({
    key,
    label:
      key === today
        ? 'Hôm nay'
        : key === yesterday
          ? 'Hôm qua'
          : new Date(key).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
    activities: acts,
  }))
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ActivityItem({
  activity,
  isLast,
}: {
  activity: FileActivity
  isLast: boolean
}) {
  const config = getConfig(activity.action)
  const ActionIcon = config.icon
  const { Icon: FileIcon, colorClass: fileColorClass } = getFileIcon(
    activity.file?.mimeType || '',
  )

  const user = activity.user
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
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
    <div className="flex gap-3 group">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            config.bgClass,
          )}
        >
          <ActionIcon className={cn('h-4 w-4', config.colorClass)} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/60 mt-2" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0', !isLast && 'pb-5')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-sm font-semibold', config.colorClass)}>
                {config.label}
              </span>
              {activity.blockchainTxHash && (
                <Badge
                  variant="outline"
                  className="h-5 text-[10px] font-normal py-0 px-1.5 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-500"
                >
                  <Link2 className="h-2.5 w-2.5 mr-0.5" />
                  On-chain
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <FileIcon
                className={cn('h-3.5 w-3.5 shrink-0', fileColorClass)}
              />
              <p className="text-sm text-foreground/80 truncate">
                {activity.file?.filename || 'Tệp không xác định'}
                {shareDetails && (
                  <span className="text-muted-foreground">
                    {' '}
                    · {shareDetails}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatTime(activity.createdAt)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
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

        <div className="flex items-center gap-1.5 mt-1.5">
          <Avatar className="h-4 w-4 shrink-0">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{user.name}</span>
          {activity.ipAddress && (
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">
              · {activity.ipAddress}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

import React from 'react'

export function ActivityList({ activities }: ActivityListProps) {
  const groups = groupByDate(activities)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              {group.label}
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div>
            {group.activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === group.activities.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
