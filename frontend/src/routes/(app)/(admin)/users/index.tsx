import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  getAdminUsersFn,
  updateUserRoleFn,
  banUserFn,
} from '@/api/admin/functions'
import { AdminUser } from '@/api/admin/types'
import { Button } from '@/components/ui/button'
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
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { useDetailBar } from '../../-context/detail-bar-context'
import { UserList } from './-components/user-list'

export const Route = createFileRoute('/(app)/(admin)/users/')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [roleDialogUser, setRoleDialogUser] = useState<AdminUser | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const {
    userRole,
    userStatus,
    userSortBy,
    userSortOrder,
    setUserSortBy,
    setUserSortOrder,
  } = useDetailBar()

  const handleSort = (field: 'name' | 'createdAt' | 'ownedFiles') => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setUserSortBy(field)
      setUserSortOrder('asc')
    }
    setPage(1)
  }

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin',
      'users',
      page,
      userRole,
      userStatus,
      userSortBy,
      userSortOrder,
    ],
    queryFn: () =>
      getAdminUsersFn({
        data: {
          page,
          limit: 20,
          role: userRole || undefined,
          status: userStatus || undefined,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
        },
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

  const users = data?.users ?? []

  return (
    <div className="flex flex-col">
      {/* Main Content Area */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Đang tải người dùng...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
              <Users className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy người dùng
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Không có người dùng nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <UserList
            users={users}
            onChangeRole={handleChangeRole}
            onToggleBan={handleToggleBan}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
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

      {/* Role change dialog */}
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
