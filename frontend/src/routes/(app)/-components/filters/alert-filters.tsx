import type { AlertLevel, AlertType } from '@/api/admin/types'

interface AlertFiltersProps {
  level: 'all' | AlertLevel
  type: 'all' | AlertType
  unresolvedOnly: boolean
  onLevelChange: (level: 'all' | AlertLevel) => void
  onTypeChange: (type: 'all' | AlertType) => void
  onUnresolvedOnlyChange: (v: boolean) => void
}

export function AlertFilters(_props: AlertFiltersProps) {
  return null
}
