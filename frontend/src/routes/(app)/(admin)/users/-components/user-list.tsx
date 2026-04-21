import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Shield,
  Ban,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react'
import { AdminUser } from '@/api/admin/types'
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
import { useDetailBar } from '@/routes/(app)/-context/detail-bar-context'
import { formatDate } from '@/lib/file-utils'
import { getAvatarUrl } from '@/lib/avatar-utils'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Trưởng phòng',
  user: 'Người dùng',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  user: 'outline',
}

interface UserListProps {
  users: AdminUser[]
  onChangeRole: (user: AdminUser) => void
  onToggleBan: (user: AdminUser) => void
  onSort: (field: 'name' | 'createdAt' | 'ownedFiles') => void
}

const columns = (
  onSort: (field: 'name' | 'createdAt' | 'ownedFiles') => void,
): ColumnDef<AdminUser>[] => [
  {
    id: 'user',
    header: () => (
      <Button
        variant="ghost"
        onClick={() => onSort('name')}
        className="h-auto p-0 font-medium"
      >
        Người dùng
        <ArrowUpDown className="h-2 w-2" />
      </Button>
    ),
    meta: { className: 'w-1/3' },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={getAvatarUrl(user.avatar)} />
            <AvatarFallback className="text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'role',
    header: 'Vai trò',
    cell: ({ row }) => {
      const user = row.original
      return (
        <Badge variant={roleBadgeVariant[user.role.name] ?? 'outline'}>
          {roleLabels[user.role.name] ?? user.role.name}
        </Badge>
      )
    },
  },
  {
    id: 'files',
    header: () => (
      <Button
        variant="ghost"
        onClick={() => onSort('ownedFiles')}
        className="h-auto p-0 font-medium"
      >
        Tài liệu
        <ArrowUpDown className="h-2 w-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original._count.ownedFiles} file
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Trạng thái',
    cell: ({ row }) =>
      row.original.isBanned ? (
        <Badge variant="destructive">Đã khóa</Badge>
      ) : (
        <Badge variant="secondary">Hoạt động</Badge>
      ),
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
      const user = row.original
      const { onChangeRole, onToggleBan } = table.options.meta as {
        onChangeRole: (user: AdminUser) => void
        onToggleBan: (user: AdminUser) => void
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
              <DropdownMenuItem onClick={() => onChangeRole(user)}>
                <Shield className="h-4 w-4" />
                Thay đổi vai trò
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onToggleBan(user)}
                variant={user.isBanned ? undefined : 'destructive'}
              >
                {user.isBanned ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Mở khóa tài khoản
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    Khóa tài khoản
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export function UserList({
  users,
  onChangeRole,
  onToggleBan,
  onSort,
}: UserListProps) {
  const { selectedUser, setSelectedUser, toggle, isOpen } = useDetailBar()

  const table = useReactTable({
    data: users,
    columns: columns(onSort),
    getCoreRowModel: getCoreRowModel(),
    meta: { onChangeRole, onToggleBan },
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
              <TableRow
                key={row.id}
                onClick={() => {
                  setSelectedUser(row.original)
                  if (!isOpen) toggle()
                }}
                className={cn(
                  'cursor-pointer',
                  selectedUser?.id === row.original.id && 'bg-muted/50',
                )}
              >
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
                Không tìm thấy người dùng
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
    </div>
  )
}
