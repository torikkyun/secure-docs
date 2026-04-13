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
  Eye,
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
import {
  FileActivity,
  ShareActivity,
  ViewActivity,
} from '@/api/file-activity/types'

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
  VIEW: {
    icon: Eye,
    label: 'Xem tài liệu',
    colorClass: 'text-sky-600',
    bgClass: 'bg-sky-50 dark:bg-sky-950/50',
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
  } else if (activity.action === 'VIEW') {
    const a = activity as ViewActivity
    shareDetails = a.viewedByOwner ? 'bởi chủ sở hữu' : 'bởi người được chia sẻ'
  }

  return (
    <div className="flex gap-4 group">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-background z-10',
            config.bgClass,
          )}
        >
          <ActionIcon className={cn('h-4 w-4', config.colorClass)} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-2 mb-2" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0', !isLast && 'pb-6')}>
        <div className="bg-card border border-border/50 hover:border-border hover:shadow-sm rounded-xl p-4 transition-all duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn('text-sm font-semibold', config.colorClass)}
                >
                  {config.label}
                </span>
                {activity.blockchainTxHash && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-medium py-0 px-2 rounded-full border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-700/50 dark:text-amber-500 dark:bg-amber-950/20"
                  >
                    {/* <Link2 className="h-2.5 w-2.5 mr-1" /> */}
                    On-chain
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2.5 bg-muted/40 w-fit pr-4 rounded-lg p-1.5 border border-border/50">
                <div className="h-7 w-7 flex items-center justify-center bg-background rounded-md shadow-sm border border-border/50 shrink-0">
                  <FileIcon className={cn('h-4 w-4', fileColorClass)} />
                </div>
                <p className="text-sm font-medium truncate">
                  {activity.file?.filename || 'Tệp không xác định'}
                  {shareDetails && (
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      · {shareDetails}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5 shrink-0 ring-1 ring-border shadow-sm">
                  <AvatarImage
                    src={getAvatarUrl(user?.avatar)}
                    alt={user?.name ?? ''}
                  />
                  <AvatarFallback className="text-[9px] font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {user?.name}
                  </span>
                  {activity.ipAddress && (
                    <span className="hidden sm:inline-block before:content-['·'] before:mx-1.5 opacity-70">
                      IP: {activity.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between self-stretch shrink-0">
              <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/50">
                {formatTime(activity.createdAt)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-md',
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Mở menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {activity.blockchainTxHash ? (
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          `https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`,
                          '_blank',
                        )
                      }
                      className="cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
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
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { getAvatarUrl } from '@/lib/avatar-utils'

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
