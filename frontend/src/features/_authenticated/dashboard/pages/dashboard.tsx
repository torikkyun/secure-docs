import { Route } from '@/routes/_authenticated/route'
import { DashboardStats } from '../components/dashboard-stats'
import { FileGrid } from '../components/file-grid'
import { RecentActivity } from '../components/recent-activity'
import { QuickActions } from '../components/quick-actions'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { getDashboardStatsFn, getRecentActivitiesFn, getRecentFilesFn } from '../functions'
import { useQuery } from '@tanstack/react-query'
import { FileItem } from '../../files/types'

export function Dashboard() {
  const { user } = Route.useLoaderData()

  // Fetch dashboard data
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStatsFn(),
  })

  const { data: recentActivitiesData } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => getRecentActivitiesFn(),
  })

  const { data: recentFilesData } = useQuery({
    queryKey: ['recent-files'],
    queryFn: () => getRecentFilesFn(),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header with breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/_authenticated/dashboard">SecureDocs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}. Manage your secure documents with confidence.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview */}
      <DashboardStats stats={statsData} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Files */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Files</h2>
            <span className="text-sm text-muted-foreground">Updated 2 hours ago</span>
          </div>
          <Separator />
          <FileGrid files={recentFilesData?.files || []} onShare={() => {}} onDownload={() => {}} />
        </div>

          {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
            <span className="text-sm text-muted-foreground">Last 24 hours</span>
          </div>
          <Separator />
          <RecentActivity activities={recentActivitiesData?.data || []} />
        </div>
      </div>
    </div>
  )
}
