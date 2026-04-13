import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { getAlertsFn, resolveAlertFn } from '@/api/admin/functions'
import { useDetailBar } from '@/routes/(app)/-context/detail-bar-context'
import { AlertsResult } from '@/api/admin/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AlertList } from './-components/alert-list'

export const Route = createFileRoute('/(app)/(admin)/alerts/')({
  component: AdminAlertsPage,
})

function AdminAlertsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const {
    setSelectedAlert,
    selectedAlert,
    alertLevel,
    alertType,
    alertUnresolvedOnly,
  } = useDetailBar()

  // Cleanup on unmount
  useEffect(() => {
    return () => setSelectedAlert(null)
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [alertLevel, alertType, alertUnresolvedOnly])

  const { data, isLoading } = useQuery<AlertsResult>({
    queryKey: [
      'admin',
      'alerts',
      page,
      alertLevel,
      alertType,
      alertUnresolvedOnly,
    ],
    queryFn: () =>
      getAlertsFn({
        data: {
          page,
          limit: 20,
          level: alertLevel === 'all' ? undefined : alertLevel,
          type: alertType === 'all' ? undefined : alertType,
          isResolved: alertUnresolvedOnly ? false : undefined,
        },
      }) as Promise<AlertsResult>,
  })

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) =>
      resolveAlertFn({ data: { alertId, isResolved: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'unresolved-alert-count'],
      })
      toast.success('Đã đánh dấu đã xử lý')
      if (selectedAlert)
        setSelectedAlert({ ...selectedAlert, isResolved: true })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleResolve = useCallback(
    (id: string) => resolveMutation.mutate(id),
    [],
  )

  return (
    <div className="flex flex-col space-y-6">
      <AlertList
        alerts={data?.alerts ?? []}
        isLoading={isLoading}
        onResolve={handleResolve}
        isResolvePending={resolveMutation.isPending}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng {data.total} cảnh báo — Trang {data.page} / {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
