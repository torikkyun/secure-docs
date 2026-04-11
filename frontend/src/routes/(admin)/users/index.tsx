import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
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
import { MoreHorizontal, Search, Shield, Ban, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
// use-debounce removed — use built-in debounce via useRef

export const Route = createFileRoute('/(admin)/users/')({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quản lý vai trò và trạng thái tài khoản người dùng
        </p>
      </div>

      <div className="relative w-full max-w-sm">
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

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Người dùng</th>
              <th className="text-left px-4 py-3 font-medium">Vai trò</th>
              <th className="text-left px-4 py-3 font-medium">Tài liệu</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={roleBadgeVariant[user.role.name] ?? 'outline'}
                    >
                      {roleLabels[user.role.name] ?? user.role.name}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.ownedFiles} file
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <Badge variant="destructive">Đã khóa</Badge>
                    ) : (
                      <Badge variant="secondary">Hoạt động</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'h-8 w-8',
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setRoleDialogUser(user)
                            setSelectedRole(user.role.name)
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Thay đổi vai trò
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            banMutation.mutate({
                              userId: user.id,
                              isBanned: !user.isBanned,
                            })
                          }
                          variant={user.isBanned ? undefined : 'destructive'}
                        >
                          {user.isBanned ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Mở khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Khóa tài khoản
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            {!isLoading && data?.users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không tìm thấy người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
