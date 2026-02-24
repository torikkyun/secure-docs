import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getUserFileActivitiesFn } from '@/api/file-activity/functions'
import { FileActivity } from '@/api/file-activity/types'
import { ActivityFeed } from './-components/activity-feed'
import { ActivityFilters } from './-components/activity-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Clock,
  FileText,
  Download,
  Upload,
  Share2,
} from 'lucide-react'

export const Route = createFileRoute('/(app)/file-activity')({
  component: FileActivityPage,
})

export function FileActivityPage() {
  const [currentPage] = useState(1)
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch real activities data
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['file-activities', currentPage, selectedAction],
    queryFn: () =>
      getUserFileActivitiesFn({ data: { page: currentPage, limit: 20 } }),
  })

  const activities = (activitiesData?.data || []) as FileActivity[]
  const total = activitiesData?.total || 0

  // Filter activities based on search and action
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.file.filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction =
      selectedAction === 'all' ||
      activity.action.toLowerCase() === selectedAction
    return matchesSearch && matchesAction
  })

  const activityStats = {
    total: total,
    uploads: activities.filter((a) => a.action === 'UPLOAD').length,
    downloads: activities.filter((a) => a.action === 'DOWNLOAD').length,
    shares: activities.filter((a) => a.action === 'SHARE').length,
    blockchainLogged: activities.filter((a) => a.blockchainTxHash).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Lịch sử hoạt động
          </h1>
          <p className="text-muted-foreground">
            Theo dõi toàn bộ hoạt động trên tệp tin của bạn
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Activity className="mr-1 h-3 w-3" />
          Giám sát thời gian thực
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.total}</div>
            <p className="text-xs text-muted-foreground">Tổng số hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.uploads}</div>
            <p className="text-xs text-muted-foreground">Tệp đã tải lên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.downloads}</div>
            <p className="text-xs text-muted-foreground">Lượt tải xuống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blockchain Logs
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.blockchainLogged}
            </div>
            <p className="text-xs text-muted-foreground">
              Bản ghi xác minh on-chain
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          {/* Filters */}
          <ActivityFilters
            selectedAction={selectedAction}
            onActionChange={setSelectedAction}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalResults={filteredActivities.length}
            totalActivities={activities.length}
          />

          {/* Feed */}
          <ActivityFeed activities={filteredActivities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
