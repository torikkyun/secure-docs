import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  ArrowUpDown,
} from 'lucide-react'
import { GroupItem } from '@/api/group/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/file-utils'
import { getAvatarUrl } from '@/lib/avatar-utils'

interface GroupListProps {
  groups: GroupItem[]
  onEdit: (group: GroupItem) => void
  onDelete: (group: GroupItem) => void
  onManageMembers: (group: GroupItem) => void
  onSort: (field: 'name' | 'createdAt' | 'members') => void
}

const columns = (
  onSort: (field: 'name' | 'createdAt' | 'members') => void,
): ColumnDef<GroupItem>[] => [
  {
    id: 'name',
    header: () => (
      <Button
        variant="ghost"
        onClick={() => onSort('name')}
        className="h-auto p-0 font-medium"
      >
        Nhóm
        <ArrowUpDown className="h-2 w-2" />
      </Button>
    ),
    meta: { className: 'w-1/3' },
    cell: ({ row }) => {
      const group = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{group.name}</p>
            {group.description && (
              <p className="text-xs text-muted-foreground truncate">
                {group.description}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    id: 'members',
    header: () => (
      <Button
        variant="ghost"
        onClick={() => onSort('members')}
        className="h-auto p-0 font-medium"
      >
        Thành viên
        <ArrowUpDown className="h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="gap-1">
        <Users className="h-3 w-3" />
        {row.original._count?.members ?? 0}
      </Badge>
    ),
  },
  {
    id: 'createdBy',
    header: 'Tạo bởi',
    cell: ({ row }) => {
      const creator = row.original.createdBy
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={getAvatarUrl(creator.avatar)} />
            <AvatarFallback className="text-xs">
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{creator.name}</span>
        </div>
      )
    },
  },
  {
    id: 'createdAt',
    header: () => (
      <Button
        variant="ghost"
        onClick={() => onSort('createdAt')}
        className="h-auto p-0 font-medium"
      >
        Ngày tạo
        <ArrowUpDown className="h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    meta: { className: 'w-px' },
    enableHiding: false,
    cell: ({ row, table }) => {
      const group = row.original
      const { onEdit, onDelete, onManageMembers } = table.options.meta as {
        onEdit: (group: GroupItem) => void
        onDelete: (group: GroupItem) => void
        onManageMembers: (group: GroupItem) => void
      }
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0',
              )}
            >
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManageMembers(group)}>
                <UserPlus className="h-4 w-4" />
                Quản lý thành viên
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(group)}>
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(group)}
              >
                <Trash2 className="h-4 w-4" />
                Xóa nhóm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function GroupList({
  groups,
  onEdit,
  onDelete,
  onManageMembers,
  onSort,
}: GroupListProps) {
  const table = useReactTable({
    data: groups,
    columns: columns(onSort),
    getCoreRowModel: getCoreRowModel(),
    meta: { onEdit, onDelete, onManageMembers },
  })

  return (
    <div className="rounded-md pr-2">
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    (header.column.columnDef.meta as { className?: string })
                      ?.className
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      (cell.column.columnDef.meta as { className?: string })
                        ?.className
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center text-muted-foreground"
              >
                Không tìm thấy nhóm nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
    </div>
  )
}
