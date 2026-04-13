import { useState } from 'react'
import {
  ChevronDown,
  X,
  Check,
  FileText,
  FileSpreadsheet,
  Image,
  Search,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AlertLevel, AlertType } from '@/api/admin/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { FileClassification } from '@/api/file/types'

export type { FileClassification }

export type FileTypeFilter = 'pdf' | 'word' | 'excel' | 'image'

export interface PersonFilter {
  id: string
  name: string
  email: string
  avatar: string
  role?: 'owner' | 'shared'
}

interface FileFiltersProps {
  fileType?: FileTypeFilter
  classification?: FileClassification
  selectedPerson?: PersonFilter | null
  availablePeople: PersonFilter[]
  onFileTypeChange: (type: FileTypeFilter | undefined) => void
  onClassificationChange: (c: FileClassification | undefined) => void
  onPersonChange: (person: PersonFilter | null) => void
}

const FILE_TYPE_OPTIONS: {
  id: FileTypeFilter
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  colorClass: string
}[] = [
  { id: 'pdf', label: 'PDF', icon: FileText, colorClass: '!text-red-500' },
  { id: 'word', label: 'Word', icon: FileText, colorClass: '!text-blue-600' },
  {
    id: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    colorClass: '!text-green-600',
  },
  {
    id: 'image',
    label: 'Hình ảnh',
    icon: Image,
    colorClass: '!text-violet-500',
  },
]

const CLASSIFICATION_OPTIONS: {
  id: FileClassification
  label: string
  dotClass: string
}[] = [
  { id: 'UNCLASSIFIED', label: 'Chưa phân loại', dotClass: 'bg-slate-400' },
  { id: 'PUBLIC', label: 'Công khai', dotClass: 'bg-green-500' },
  { id: 'INTERNAL', label: 'Nội bộ', dotClass: 'bg-amber-500' },
  { id: 'CONFIDENTIAL', label: 'Bảo mật', dotClass: 'bg-orange-500' },
  { id: 'RESTRICTED', label: 'Tối mật', dotClass: 'bg-red-500' },
]

export interface ChipProps {
  label: React.ReactNode
  isActive: boolean
  onClear: () => void
  children: React.ReactNode
  contentClassName?: string
  onOpenChange?: (open: boolean) => void
}

export function FilterChip({
  label,
  isActive,
  onClear,
  children,
  contentClassName,
  onOpenChange,
}: ChipProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <div
        className={cn(
          'flex items-center h-8 rounded-full border transition-colors',
          isActive
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <DropdownMenuTrigger
          className={cn(
            'flex items-center gap-1.5 px-3 text-sm font-medium outline-none h-full',
            isActive && 'pr-2',
          )}
        >
          {label}
          {!isActive && (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </DropdownMenuTrigger>
        {isActive && (
          <div className="flex items-center pr-2">
            <div className="h-4 w-px bg-primary/20 mr-1.5" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="flex items-center justify-center h-5 w-5 rounded-full hover:bg-primary/20 transition-colors"
              aria-label="Xóa lọc"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <DropdownMenuContent
        align="start"
        className={cn('p-1.5', contentClassName ?? 'w-50')}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FileFilters({
  fileType,
  classification,
  selectedPerson,
  availablePeople,
  onFileTypeChange,
  onClassificationChange,
  onPersonChange,
}: FileFiltersProps) {
  const hasFilter = !!fileType || !!classification || !!selectedPerson
  const [peopleSearch, setPeopleSearch] = useState('')
  const filteredPeople = peopleSearch
    ? availablePeople.filter(
        (p) =>
          p.name?.toLowerCase().includes(peopleSearch.toLowerCase()) ||
          p.email.toLowerCase().includes(peopleSearch.toLowerCase()),
      )
    : availablePeople

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* File type filter */}
      <FilterChip
        contentClassName="w-40"
        label={
          fileType ? (
            <div className="flex items-center gap-1.5">
              {(() => {
                const opt = FILE_TYPE_OPTIONS.find((o) => o.id === fileType)!
                const Icon = opt.icon
                return (
                  <Icon className={cn('h-4 w-4 shrink-0', opt.colorClass)} />
                )
              })()}
              <span>
                {FILE_TYPE_OPTIONS.find((o) => o.id === fileType)!.label}
              </span>
            </div>
          ) : (
            'Loại tài liệu'
          )
        }
        isActive={!!fileType}
        onClear={() => onFileTypeChange(undefined)}
      >
        {FILE_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = fileType === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() =>
                onFileTypeChange(isSelected ? undefined : option.id)
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

      {/* Classification filter */}
      <FilterChip
        contentClassName="w-48"
        label={
          classification ? (
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  CLASSIFICATION_OPTIONS.find((o) => o.id === classification)
                    ?.dotClass,
                )}
              />
              <span>
                {
                  CLASSIFICATION_OPTIONS.find((o) => o.id === classification)
                    ?.label
                }
              </span>
            </div>
          ) : (
            'Mức độ bảo mật'
          )
        }
        isActive={!!classification}
        onClear={() => onClassificationChange(undefined)}
      >
        {CLASSIFICATION_OPTIONS.map((option) => {
          const isSelected = classification === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() =>
                onClassificationChange(isSelected ? undefined : option.id)
              }
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected ? (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                ) : (
                  <div
                    className={cn('h-2 w-2 rounded-full', option.dotClass)}
                  />
                )}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>

      {/* People filter */}
      <FilterChip
        contentClassName="w-64"
        onOpenChange={(open) => {
          if (!open) setPeopleSearch('')
        }}
        label={
          selectedPerson ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5 border">
                <AvatarImage src={getAvatarUrl(selectedPerson.avatar)} />
                <AvatarFallback className="text-[9px]">
                  {selectedPerson.name
                    ? selectedPerson.name.slice(0, 2).toUpperCase()
                    : selectedPerson.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-25">
                {selectedPerson.name || selectedPerson.email}
                {selectedPerson.role && (
                  <span className="ml-1 opacity-70">
                    · {selectedPerson.role === 'owner' ? 'Sở hữu' : 'Chia sẻ'}
                  </span>
                )}
              </span>
            </div>
          ) : (
            'Người'
          )
        }
        isActive={!!selectedPerson}
        onClear={() => onPersonChange(null)}
      >
        <div className="px-1.5 pb-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              className="w-full rounded-md border border-input bg-transparent pl-7 pr-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="Tìm người..."
              value={peopleSearch}
              onChange={(e) => setPeopleSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        {filteredPeople.length === 0 ? (
          <DropdownMenuItem disabled>
            {peopleSearch ? 'Không tìm thấy' : 'Không có dữ liệu'}
          </DropdownMenuItem>
        ) : (
          <>
            {filteredPeople.map((person) => {
              const isSelected = selectedPerson?.id === person.id
              const initials = person.name
                ? person.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : person.email.substring(0, 2).toUpperCase()
              return (
                <DropdownMenuSub key={person.id}>
                  <DropdownMenuSubTrigger
                    className={cn(
                      'gap-2.5 rounded-md p-2 cursor-pointer',
                      isSelected && 'text-primary',
                    )}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                      <Avatar className="h-6 w-6 border">
                        <AvatarImage
                          src={getAvatarUrl(person.avatar)}
                          alt={person.name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium leading-none mb-1 truncate h-4">
                        {person.name || person.email}
                      </span>
                      {person.name && (
                        <span className="text-xs text-muted-foreground leading-none truncate">
                          {person.email}
                        </span>
                      )}
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-44">
                    <DropdownMenuItem
                      onClick={() =>
                        onPersonChange({ ...person, role: 'owner' })
                      }
                      className={cn(
                        'gap-2 cursor-pointer',
                        isSelected &&
                          selectedPerson?.role === 'owner' &&
                          'text-primary',
                      )}
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && selectedPerson?.role === 'owner' && (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        )}
                      </div>
                      Chủ sở hữu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onPersonChange({ ...person, role: 'shared' })
                      }
                      className={cn(
                        'gap-2 cursor-pointer',
                        isSelected &&
                          selectedPerson?.role === 'shared' &&
                          'text-primary',
                      )}
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && selectedPerson?.role === 'shared' && (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        )}
                      </div>
                      Được chia sẻ với
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )
            })}
          </>
        )}
      </FilterChip>

      {/* Reset all */}
      {hasFilter && (
        <button
          onClick={() => {
            onFileTypeChange(undefined)
            onClassificationChange(undefined)
            onPersonChange(null)
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}

// ─── Activity Filters ────────────────────────────────────────────────────────

import type { FileActivityAction } from '@/api/file-activity/schemas'
import { Upload, Download, Share2, Trash2, ShieldOff, Eye } from 'lucide-react'
import { getAvatarUrl } from '@/lib/avatar-utils'

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

// ─── Alert Filters ─────────────────────────────────────────────────────────────

const ALERT_LEVEL_OPTIONS: {
  id: AlertLevel
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'WARNING', label: 'Cảnh báo', icon: AlertTriangle },
  { id: 'ALERT', label: 'Nghiêm trọng', icon: AlertOctagon },
  { id: 'CRITICAL', label: 'Cực kỳ nghiêm trọng', icon: ShieldAlert },
]

const ALERT_TYPE_OPTIONS: { id: AlertType; label: string }[] = [
  { id: 'STATISTICAL', label: 'Thống kê (Z-Score)' },
  { id: 'POLICY', label: 'Vi phạm quy tắc' },
]

interface AlertFiltersProps {
  level: 'all' | AlertLevel
  type: 'all' | AlertType
  unresolvedOnly: boolean
  onLevelChange: (level: 'all' | AlertLevel) => void
  onTypeChange: (type: 'all' | AlertType) => void
  onUnresolvedOnlyChange: (v: boolean) => void
}

export function AlertFilters({
  level,
  type,
  unresolvedOnly,
  onLevelChange,
  onTypeChange,
  onUnresolvedOnlyChange,
}: AlertFiltersProps) {
  const activeLevel = ALERT_LEVEL_OPTIONS.find((o) => o.id === level)

  return (
    <div className="flex items-center gap-2 flex-wrap pb-2">
      <FilterChip
        contentClassName="w-52"
        label={
          activeLevel ? (
            <div className="flex items-center gap-1.5">
              <activeLevel.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{activeLevel.label}</span>
            </div>
          ) : (
            'Mức độ'
          )
        }
        isActive={level !== 'all'}
        onClear={() => onLevelChange('all')}
      >
        {ALERT_LEVEL_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = level === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onLevelChange(isSelected ? 'all' : option.id)}
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected ? (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>

      <FilterChip
        contentClassName="w-56"
        label={
          type !== 'all' ? (
            <span>{ALERT_TYPE_OPTIONS.find((o) => o.id === type)!.label}</span>
          ) : (
            'Loại cảnh báo'
          )
        }
        isActive={type !== 'all'}
        onClear={() => onTypeChange('all')}
      >
        {ALERT_TYPE_OPTIONS.map((option) => {
          const isSelected = type === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onTypeChange(isSelected ? 'all' : option.id)}
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                )}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>

      <FilterChip
        contentClassName="w-48"
        label={unresolvedOnly ? 'Chưa xử lý' : 'Trạng thái xử lý'}
        isActive={unresolvedOnly}
        onClear={() => onUnresolvedOnlyChange(false)}
      >
        <DropdownMenuItem
          onClick={() => onUnresolvedOnlyChange(!unresolvedOnly)}
          className="gap-2.5 rounded-md p-2 cursor-pointer"
        >
          <div className="flex h-4 w-6 shrink-0 items-center justify-center">
            {unresolvedOnly && (
              <Check className="h-4 w-4 text-primary" strokeWidth={3} />
            )}
          </div>
          <span className="font-medium text-sm">Chỉ xem chưa xử lý</span>
        </DropdownMenuItem>
      </FilterChip>

      {(level !== 'all' || type !== 'all' || unresolvedOnly) && (
        <button
          onClick={() => {
            onLevelChange('all')
            onTypeChange('all')
            onUnresolvedOnlyChange(false)
          }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}
