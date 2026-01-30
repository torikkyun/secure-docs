import { FileText, Upload, Share2, Download, User, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
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

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => {
                const ActionIcon = getActionIcon(activity.action)
                const actionColor = getActionColor(activity.action)
                const description = getActionDescription(activity)

                return (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${actionColor}`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{' '}
                          {description}
                        </span>
                      </div>
                      {activity.action === 'SHARE' && activity.metadata?.recipients && (
                        <div className="flex items-center gap-1 ml-9">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            with {activity.metadata.recipients.slice(0, 2).map((r: any) => r.name).join(', ')}
                            {activity.metadata.recipients.length > 2 && ` +${activity.metadata.recipients.length - 2} more`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-9">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}