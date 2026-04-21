import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getLoginActivitiesFn } from '@/api/admin/functions'
import type { LoginActivitiesResult } from '@/api/admin/types'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ShieldAlert, Search } from 'lucide-react'
import { LoginActivityTable } from './-components/alert-list'

export const Route = createFileRoute('/(app)/(admin)/alerts/')({
  component: AdminAlertsPage,
})

function AdminAlertsPage() {
  const [page] = useState(1)
  const [search, setSearch] = useState('')
  const [suspiciousOnly, setSuspiciousOnly] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery<LoginActivitiesResult>({
    queryKey: [
      'admin',
      'login-activities',
      page,
      debouncedSearch,
      suspiciousOnly,
    ],
    queryFn: () =>
      getLoginActivitiesFn({
        data: {
          page,
          limit: 50,
          suspiciousOnly: suspiciousOnly || undefined,
        },
      }),
  })

  const activities = data?.activities ?? []
  const total = data?.total ?? 0
  const suspiciousCount = activities.filter((a) => a.isSuspicious).length

  const filtered = debouncedSearch
    ? activities.filter(
        (a) =>
          a.user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          a.user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          a.ipAddress.includes(debouncedSearch),
      )
    : activities

  return (
    <div className="flex flex-col">
      {/* Filter strip — same style as FileFilters in the toolbar */}
      <div className="flex items-center gap-3 flex-wrap pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm theo tên, email, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="suspicious-only"
            checked={suspiciousOnly}
            onCheckedChange={setSuspiciousOnly}
          />
          <Label htmlFor="suspicious-only" className="text-sm cursor-pointer">
            Chỉ hiển thị đáng ngờ
          </Label>
        </div>
        {suspiciousCount > 0 && !isLoading && (
          <div className="flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2.5 py-1 dark:bg-red-950/30 dark:border-red-800">
            <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">
              {suspiciousCount} đáng ngờ
            </span>
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {total} bản ghi
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-muted/30 p-6 rounded-full mb-4">
            <ShieldAlert className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Không có dữ liệu đăng nhập
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Chưa có lịch sử đăng nhập phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <LoginActivityTable activities={filtered} />
      )}
    </div>
  )
}
