import { Check } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { FilterChip } from './file-filters'

const ROLE_OPTIONS: { id: 'admin' | 'manager' | 'user'; label: string }[] = [
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Trưởng phòng' },
  { id: 'user', label: 'Người dùng' },
]

const STATUS_OPTIONS: { id: 'active' | 'banned'; label: string }[] = [
  { id: 'active', label: 'Hoạt động' },
  { id: 'banned', label: 'Đã khóa' },
]

interface UserFiltersProps {
  userRole: 'admin' | 'manager' | 'user' | ''
  userStatus: 'active' | 'banned' | ''
  onRoleChange: (role: 'admin' | 'manager' | 'user' | '') => void
  onStatusChange: (status: 'active' | 'banned' | '') => void
}

export function UserFilters({
  userRole,
  userStatus,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  const activeRole = ROLE_OPTIONS.find((o) => o.id === userRole)
  const activeStatus = STATUS_OPTIONS.find((o) => o.id === userStatus)

  return (
    <div className="flex items-center gap-2 flex-wrap pb-2">
      <FilterChip
        contentClassName="w-44"
        label={activeRole ? activeRole.label : 'Vai trò'}
        isActive={!!userRole}
        onClear={() => onRoleChange('')}
      >
        {ROLE_OPTIONS.map((option) => {
          const isSelected = userRole === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onRoleChange(isSelected ? '' : option.id)}
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected ? (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                ) : null}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>

      <FilterChip
        contentClassName="w-44"
        label={activeStatus ? activeStatus.label : 'Trạng thái'}
        isActive={!!userStatus}
        onClear={() => onStatusChange('')}
      >
        {STATUS_OPTIONS.map((option) => {
          const isSelected = userStatus === option.id
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onStatusChange(isSelected ? '' : option.id)}
              className="gap-2.5 rounded-md p-2 cursor-pointer"
            >
              <div className="flex h-4 w-6 shrink-0 items-center justify-center">
                {isSelected ? (
                  <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                ) : null}
              </div>
              <span className="font-medium text-sm">{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </FilterChip>
    </div>
  )
}
