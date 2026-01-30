import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Route } from '@/routes/_authenticated/route'
import { getUserFileActivitiesFn } from '../functions'
import { ActivityItem } from '../types'
import { ActivityFeed } from '../components/activity-feed'
import { ActivityFilters } from '../components/activity-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, FileText, Download, Upload, Share2, ExternalLink } from 'lucide-react'

// Mock data types
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

export function FileActivityPage() {
  const { user } = Route.useLoaderData()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch real activities data
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['file-activities', currentPage, selectedAction],
    queryFn: () => getUserFileActivitiesFn({ data: { page: currentPage, limit: 20 } }),
  })

  const activities = activitiesData?.data || []
  const total = activitiesData?.total || 0

  // Filter activities based on search and action
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = selectedAction === 'all' || activity.action.toLowerCase() === selectedAction
    return matchesSearch && matchesAction
  })

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
      case 'UPLOAD': return 'text-green-600'
      case 'DOWNLOAD': return 'text-blue-600'
      case 'SHARE': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const activityStats = {
    total: activities.length,
    uploads: activities.filter((a: ActivityItem) => a.action === 'UPLOAD').length,
    downloads: activities.filter((a: ActivityItem) => a.action === 'DOWNLOAD').length,
    shares: activities.filter((a: ActivityItem) => a.action === 'SHARE').length,
    blockchainLogged: activities.filter((a: ActivityItem) => a.blockchainTxHash).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Activity</h1>
          <p className="text-muted-foreground">
            Track all file operations and maintain audit trails
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Activity className="mr-1 h-3 w-3" />
          Real-time monitoring
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activityStats.uploads}</div>
            <p className="text-xs text-muted-foreground">
              Files uploaded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activityStats.downloads}</div>
            <p className="text-xs text-muted-foreground">
              Files accessed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{activityStats.shares}</div>
            <p className="text-xs text-muted-foreground">
              Files shared
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-chain</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activityStats.blockchainLogged}</div>
            <p className="text-xs text-muted-foreground">
              Blockchain logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ActivityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAction={selectedAction}
        onActionChange={setSelectedAction}
        totalResults={filteredActivities.length}
        totalActivities={total}
      />

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Feed</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Live updates</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading activities...</div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No activities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedAction !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Activities will appear here as files are uploaded, shared, and downloaded'
                }
              </p>
            </div>
          ) : (
            <ActivityFeed activities={filteredActivities} />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {activitiesData?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredActivities.length} of {total} activities
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(activitiesData.totalPages, currentPage + 1))}
              disabled={currentPage === activitiesData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}