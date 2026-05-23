import { useEffect, useRef, useCallback, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Loader2,
  Download,
  Share2,
  Trash2,
  ShieldOff,
  Upload,
  X,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

import { getUserFileActivitiesFn } from '@/api/file-activity/functions'
import { FileActivity } from '@/api/file-activity/types'
import { ActivityList } from './-components/activity-list'
import { useDetailBar } from '../-context/detail-bar-context'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { vi } from 'date-fns/locale/vi'

export const Route = createFileRoute('/(app)/file-activity/')({
  component: FileActivityPage,
})

const statConfig = [
  {
    action: 'UPLOAD',
    label: 'Tải lên',
    icon: Upload,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50 dark:bg-green-950/50',
  },
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
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
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

export function FileActivityPage() {
  const { activityAction } = useDetailBar()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [date, setDate] = useState<DateRange | undefined>()

  const startDateStr = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined
  const endDateStr = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined

  const {
    data: activitiesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['file-activities', activityAction, startDateStr, endDateStr],
    queryFn: ({ pageParam }) =>
      getUserFileActivitiesFn({
        data: {
          page: pageParam as number,
          limit: 20,
          action: activityAction,
          startDate: startDateStr,
          endDate: endDateStr,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const activities: FileActivity[] = (activitiesData?.pages ?? [])
    .flatMap((p) => p.data ?? [])
    .filter((a): a is FileActivity => a != null)

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

  const calendarSidebar = (
    <div className="w-full xl:w-[320px] shrink-0 order-first xl:order-last mr-1">
      <div className="sticky top-6 border border-border/50 bg-card rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 min-h-8 ml-6 mr-4">
          <h3 className="font-semibold text-sm">Lọc theo ngày</h3>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDate(undefined)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Xóa lọc
            </Button>
          )}
        </div>
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          locale={vi}
          className="p-0 flex justify-center w-full [--cell-size:--spacing(9)]"
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col mt-1">
      <div className="mb-6 px-0.5">
        <ActivityStats stats={stats} />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 w-full min-h-95">
              <div className="text-muted-foreground">Đang tải hoạt động...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-border/50 bg-card/50 rounded-xl w-full min-h-95">
              <div className="bg-muted/50 p-5 rounded-full mb-4">
                <Activity className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Chưa có hoạt động nào
              </h3>
              <p className="text-[13px] text-muted-foreground max-w-sm">
                Không tìm thấy dữ liệu cho khoảng thời gian này.
              </p>
            </div>
          ) : (
            <ActivityList activities={activities} />
          )}

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {calendarSidebar}
      </div>
    </div>
  )
}
