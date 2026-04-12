import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Loader2,
  Download,
  Share2,
  Trash2,
  ShieldOff,
} from 'lucide-react'
import { getUserFileActivitiesFn } from '@/api/file-activity/functions'
import { FileActivity } from '@/api/file-activity/types'
import { ActivityList } from './-components/activity-list'
import { useDetailBar } from '../-context/detail-bar-context'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(app)/file-activity/')({
  component: FileActivityPage,
})

const statConfig = [
  {
    action: 'DOWNLOAD',
    label: 'Tải xuống',
    icon: Download,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    action: 'SHARE',
    label: 'Chia sẻ',
    icon: Share2,
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
  },
  {
    action: 'DELETE',
    label: 'Đã xóa',
    icon: Trash2,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/50',
  },
  {
    action: 'REVOKE_SHARE',
    label: 'Thu hồi',
    icon: ShieldOff,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50 dark:bg-orange-950/50',
  },
]

function ActivityStats({ stats }: { stats: Record<string, number> }) {
  const counts = stats

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {statConfig.map(({ action, label, icon: Icon, colorClass, bgClass }) => (
        <div
          key={action}
          className="flex items-center justify-between gap-2.5 rounded-xl border bg-card/50 p-3.5 shadow-sm hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-xl font-bold tracking-tight">
              {counts[action] ?? 0}
            </p>
          </div>
          <div
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
              bgClass,
            )}
          >
            <Icon className={cn('h-4.5 w-4.5', colorClass)} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-3 w-20" />
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-0">
            {[1, 2, 3].map((i, index) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center shrink-0">
                  <Skeleton className="w-10 h-10 rounded-full ring-4 ring-background z-10" />
                  {index < 2 && (
                    <div className="w-px flex-1 bg-border mt-2 mb-2" />
                  )}
                </div>
                <div className={cn('flex-1 min-w-0', index < 2 && 'pb-6')}>
                  <div className="bg-card border border-border/50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-4 w-full">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-64 max-w-full rounded-lg" />
                        <div className="flex items-center gap-2 mt-1">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-12 rounded-md shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function FileActivityPage() {
  const { activityAction } = useDetailBar()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data: activitiesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['file-activities', activityAction],
    queryFn: ({ pageParam }) =>
      getUserFileActivitiesFn({
        data: { page: pageParam as number, limit: 20, action: activityAction },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const activities: FileActivity[] =
    activitiesData?.pages.flatMap((p) => p.data) ?? []

  // Stats come from the first page (counts all records, not just loaded page)
  const stats = activitiesData?.pages[0]?.stats ?? {}

  const onSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onSentinel, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onSentinel])

  if (isLoading) {
    return (
      <div className="mt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <ActivitySkeleton />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted/30 p-5 rounded-full mb-4">
          <Activity className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động nào</h3>
        <p className="text-[13px] text-muted-foreground max-w-sm">
          Khi có bất kỳ thay đổi nào với tệp của bạn, chúng sẽ hiển thị ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col mt-1">
      <ActivityStats stats={stats} />

      <ActivityList activities={activities} />

      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
