import { Check } from 'lucide-react'
import { Upload, Download, Share2, Trash2, ShieldOff, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { FileActivityAction } from '@/api/file-activity/schemas'
import { FilterChip } from './file-filters'

const ACTIVITY_ACTION_OPTIONS: {
  id: FileActivityAction
  label: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}[] = [
  {
    id: 'UPLOAD',
    label: 'Tải lên',
    icon: Upload,
    colorClass: 'text-emerald-600',
  },
  {
    id: 'DOWNLOAD',
    label: 'Tải xuống',
    icon: Download,
    colorClass: 'text-blue-600',
  },
  {
    id: 'SHARE',
    label: 'Chia sẻ',
    icon: Share2,
    colorClass: 'text-violet-600',
  },
  { id: 'DELETE', label: 'Xóa tệp', icon: Trash2, colorClass: 'text-red-600' },
  {
    id: 'REVOKE_SHARE',
    label: 'Thu hồi quyền',
    icon: ShieldOff,
    colorClass: 'text-orange-600',
  },
  { id: 'VIEW', label: 'Xem tài liệu', icon: Eye, colorClass: 'text-sky-600' },
]

interface ActivityFiltersProps {
  activityAction?: FileActivityAction
  onActivityActionChange: (action: FileActivityAction | undefined) => void
}

export function ActivityFilters({
  activityAction,
  onActivityActionChange,
}: ActivityFiltersProps) {
  const activeOpt = ACTIVITY_ACTION_OPTIONS.find((o) => o.id === activityAction)

  return (
    <div className="flex items-center gap-2 flex-wrap pb-2">
      <FilterChip
        contentClassName="w-44"
        label={
          activeOpt ? (
            <div className="flex items-center gap-1.5">
              <activeOpt.icon
                className={cn('h-3.5 w-3.5 shrink-0', activeOpt.colorClass)}
              />
              <span>{activeOpt.label}</span>
            </div>
          ) : (
            'Loại hoạt động'
          )
        }
        isActive={!!activityAction}
        onClear={() => onActivityActionChange(undefined)}
      >
        {ACTIVITY_ACTION_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = activityAction === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() =>
                onActivityActionChange(isSelected ? undefined : option.id)
              }
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected ? (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                ) : (
                  <Icon className={cn('h-4 w-4', option.colorClass)} />
                )}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>

      {activityAction && (
        <button
          onClick={() => onActivityActionChange(undefined)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}
