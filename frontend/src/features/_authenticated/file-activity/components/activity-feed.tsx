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
import { Upload, Download, Share2, FileText, MoreHorizontal, ExternalLink, Clock, User } from 'lucide-react'

function formatTimeAgo(timestamp: string) {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMs = now.getTime() - activityTime.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  return `${diffInDays}d ago`
}

// Mock activity type
interface ActivityItem {
  id: string
  action: 'UPLOAD' | 'DOWNLOAD' | 'SHARE' | 'DELETE' | 'REVOKE_SHARE'
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  file: {
    id: string
    filename: string
    mimeType: string
  }
  metadata?: any
  blockchainTxHash?: string
  createdAt: string
  ipAddress?: string
  userAgent?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'UPLOAD': return Upload
      case 'DOWNLOAD': return Download
      case 'SHARE': return Share2
      default: return FileText
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'UPLOAD': return 'text-green-600 bg-green-50'
      case 'DOWNLOAD': return 'text-blue-600 bg-blue-50'
      case 'SHARE': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getActionDescription = (activity: ActivityItem) => {
    switch (activity.action) {
      case 'UPLOAD':
        return `uploaded "${activity.file.filename}"`
      case 'DOWNLOAD':
        return `downloaded "${activity.metadata?.filename || activity.file.filename}"`
      case 'SHARE':
        const recipients = activity.metadata?.recipients || []
        const count = activity.metadata?.shareCount || recipients.length
        if (count === 1 && recipients[0]) {
          return `shared "${activity.file.filename}" with ${recipients[0].name}`
        }
        return `shared "${activity.file.filename}" with ${count} people`
      default:
        return `${activity.action.toLowerCase()} "${activity.file.filename}"`
    }
  }

  const formatTime = (timestamp: string) => {
    return formatTimeAgo(timestamp)
  }

  return (
    <div className="space-y-4">
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
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Action Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-full ${actionColor}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">
                      {activity.user.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                    >
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
                  {activity.action === 'SHARE' && activity.metadata?.recipients && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        {activity.metadata.recipients.slice(0, 3).map((recipient: any, index: number) => (
                          <span key={recipient.id} className="text-xs text-muted-foreground">
                            {recipient.name}{index < activity.metadata.recipients.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                        {activity.metadata.recipients.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{activity.metadata.recipients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp and IP */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(activity.createdAt)}</span>
                    </div>
                    {activity.ipAddress && (
                      <span>IP: {activity.ipAddress}</span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View file details</DropdownMenuItem>
                    <DropdownMenuItem>View user profile</DropdownMenuItem>
                    {activity.blockchainTxHash && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Etherscan
                        </DropdownMenuItem>
                      </>
                    )}
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