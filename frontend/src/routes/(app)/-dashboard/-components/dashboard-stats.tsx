import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HardDrive, File, Share2, Activity, Shield, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  stats?: {
    storageUsed: number
    totalFiles: number
    activeShares: number
    recentActivity: number
    storageLimit: number
    filesAddedThisMonth: number
    sharesThisMonth: number
    activityToday: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Default mock data if API not available
  const defaultStats = {
    storageUsed: 12.5,
    totalFiles: 1234,
    activeShares: 45,
    recentActivity: 28,
    storageLimit: 50,
    filesAddedThisMonth: 140,
    sharesThisMonth: 12,
    activityToday: 28,
  }

  const currentStats = stats || defaultStats

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const statsData = [
    {
      title: 'Storage Used',
      value: formatBytes(currentStats.storageUsed * 1024 * 1024 * 1024),
      description: `${((currentStats.storageUsed / currentStats.storageLimit) * 100).toFixed(1)}% of ${formatBytes(currentStats.storageLimit * 1024 * 1024 * 1024)}`,
      icon: HardDrive,
      trend: `+${(currentStats.filesAddedThisMonth * 0.05).toFixed(1)} GB this month`,
      color: 'text-blue-600',
    },
    {
      title: 'Total Files',
      value: currentStats.totalFiles.toLocaleString(),
      description: `${currentStats.filesAddedThisMonth} files added`,
      icon: File,
      trend: `+${currentStats.filesAddedThisMonth} this month`,
      color: 'text-green-600',
    },
    {
      title: 'Active Shares',
      value: currentStats.activeShares.toString(),
      description: `${currentStats.sharesThisMonth} files shared`,
      icon: Share2,
      trend: '3 new shares today',
      color: 'text-purple-600',
    },
    {
      title: 'Secure Activity',
      value: currentStats.activityToday.toString(),
      description: 'Events today',
      icon: Shield,
      trend: 'All verified',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>{stat.trend}</span>
            </div>
          </CardContent>

          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
        </Card>
      ))}
    </div>
  )
}
