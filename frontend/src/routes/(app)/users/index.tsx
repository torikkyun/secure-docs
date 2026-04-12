import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  getAdminUsersFn,
  updateUserRoleFn,
  banUserFn,
} from '@/api/admin/functions'
import { AdminUser } from '@/api/admin/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, Search, Shield, Ban, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDetailBar } from '../-context/detail-bar-context'

export const Route = createFileRoute('/(app)/users/')({
  component: AdminUsersPage,
})

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

const columns: ColumnDef<AdminUser>[] = [
  {
    id: 'user',
    header: 'Người dùng',
    meta: { className: 'w-1/3' },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.avatar} />
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
    header: 'Tài liệu',
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
    header: 'Ngày tạo',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
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

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const [roleDialogUser, setRoleDialogUser] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const { selectedUser, setSelectedUser, toggle, isOpen } = useDetailBar()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch],
    queryFn: () =>
      getAdminUsersFn({
        data: { page, limit: 20, search: debouncedSearch || undefined },
      }),
  })

  const roleMutation = useMutation({
    mutationFn: (vars: {
      userId: string
      role: 'admin' | 'manager' | 'user'
    }) => updateUserRoleFn({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Cập nhật vai trò thành công')
      setRoleDialogUser(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const banMutation = useMutation({
    mutationFn: (vars: { userId: string; isBanned: boolean }) =>
      banUserFn({ data: vars }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(
        vars.isBanned ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      )
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleChangeRole = (user: AdminUser) => {
    setRoleDialogUser(user)
    setSelectedRole(user.role.name)
  }

  const handleToggleBan = (user: AdminUser) => {
    banMutation.mutate({ userId: user.id, isBanned: !user.isBanned })
  }

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onChangeRole: handleChangeRole, onToggleBan: handleToggleBan },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full max-w-sm mt-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy người dùng
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pr-2">
          <p className="text-sm text-muted-foreground">
            Trang {data.page} / {data.totalPages} — {data.total} người dùng
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

      <Dialog
        open={!!roleDialogUser}
        onOpenChange={(o) => {
          if (!o) setRoleDialogUser(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò — {roleDialogUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Trưởng phòng</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>
              Hủy
            </Button>
            <Button
              disabled={roleMutation.isPending}
              onClick={() => {
                if (roleDialogUser) {
                  roleMutation.mutate({
                    userId: roleDialogUser.id,
                    role: selectedRole as 'admin' | 'manager' | 'user',
                  })
                }
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
