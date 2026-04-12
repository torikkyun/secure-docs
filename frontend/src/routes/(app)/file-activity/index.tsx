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
import { ActivityGrid } from './-components/activity-grid'
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
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              bgClass,
            )}
          >
            <Icon className={cn('h-4 w-4', colorClass)} />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">
              {counts[action] ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-3 w-20" />
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-52" />
                  <Skeleton className="h-3 w-28" />
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
  const { viewMode } = useDetailBar()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data: activitiesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['file-activities'],
    queryFn: ({ pageParam }) =>
      getUserFileActivitiesFn({
        data: { page: pageParam as number, limit: 20 },
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
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-15 rounded-xl" />
          ))}
        </div>
        <ActivitySkeleton />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <Activity className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có hoạt động nào</h3>
        <p className="text-muted-foreground max-w-sm">
          Khi có bất kỳ thay đổi nào với tệp của bạn, chúng sẽ hiển thị ở đây.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <ActivityStats stats={stats} />

      {viewMode === 'list' ? (
        <ActivityList activities={activities} />
      ) : (
        <ActivityGrid activities={activities} />
      )}

      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
