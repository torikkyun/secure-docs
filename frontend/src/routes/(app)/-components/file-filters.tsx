import { useState } from 'react'
import {
  ChevronDown,
  X,
  Check,
  FileText,
  FileSpreadsheet,
  Image,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  selectedPerson?: PersonFilter | null
  availablePeople: PersonFilter[]
  onFileTypeChange: (type: FileTypeFilter | undefined) => void
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

interface ChipProps {
  label: React.ReactNode
  isActive: boolean
  onClear: () => void
  children: React.ReactNode
  contentClassName?: string
  onOpenChange?: (open: boolean) => void
}

function FilterChip({
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
  selectedPerson,
  availablePeople,
  onFileTypeChange,
  onPersonChange,
}: FileFiltersProps) {
  const hasFilter = !!fileType || !!selectedPerson
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
            'Loại'
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
                <AvatarImage src={selectedPerson.avatar} />
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
                        <AvatarImage src={person.avatar} alt={person.name} />
                        <AvatarFallback className="text-[10px]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium leading-none mb-1 truncate">
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
