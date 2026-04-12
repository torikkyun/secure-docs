import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  getGroupsFn,
  createGroupFn,
  updateGroupFn,
  deleteGroupFn,
  addGroupMemberFn,
  removeGroupMemberFn,
  getGroupByIdFn,
} from '@/api/group/functions'
import { getUsersFn } from '@/api/user/functions'
import { GroupItem } from '@/api/group/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(app)/groups/')({
  component: AdminGroupsPage,
})

function AdminGroupsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<GroupItem | null>(null)
  const [deleteGroup, setDeleteGroupTarget] = useState<GroupItem | null>(null)
  const [membersGroupId, setMembersGroupId] = useState<string | null>(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'groups', page, search],
    queryFn: () =>
      getGroupsFn({ data: { page, limit: 20, search: search || undefined } }),
  })

  const { data: groupDetail } = useQuery({
    queryKey: ['admin', 'groups', membersGroupId, 'detail'],
    queryFn: () => getGroupByIdFn({ data: { id: membersGroupId! } }),
    enabled: !!membersGroupId,
  })

  const { data: allUsers } = useQuery({
    queryKey: ['users', 1, memberSearch],
    queryFn: () =>
      getUsersFn({
        data: { page: 1, limit: 20, search: memberSearch || undefined },
      }),
    enabled: !!membersGroupId,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createGroupFn({
        data: {
          name: newGroupName.trim(),
          description: newGroupDesc.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] })
      toast.success('Tạo nhóm thành công')
      setCreateDialogOpen(false)
      setNewGroupName('')
      setNewGroupDesc('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      updateGroupFn({
        data: {
          id: editGroup!.id,
          name: editName.trim() || undefined,
          description: editDesc.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] })
      toast.success('Cập nhật nhóm thành công')
      setEditGroup(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGroupFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] })
      toast.success('Xóa nhóm thành công')
      setDeleteGroupTarget(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      addGroupMemberFn({ data: { groupId: membersGroupId!, userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'groups', membersGroupId, 'detail'],
      })
      toast.success('Đã thêm thành viên')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      removeGroupMemberFn({ data: { groupId: membersGroupId!, memberId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'groups', membersGroupId, 'detail'],
      })
      toast.success('Đã xóa thành viên')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const memberIds = new Set(groupDetail?.members?.map((m) => m.id) ?? [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản lý nhóm
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tạo và quản lý các nhóm người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo nhóm mới
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm nhóm..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <p className="text-muted-foreground col-span-full text-center py-10">
            Đang tải...
          </p>
        )}
        {!isLoading &&
          data?.groups.map((group) => (
            <div
              key={group.id}
              className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{group.name}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">
                      {group._count?.members ?? 0} thành viên
                    </Badge>
                  </div>
                </div>
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
                      onClick={() => setMembersGroupId(group.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Quản lý thành viên
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditGroup(group)
                        setEditName(group.name)
                        setEditDesc(group.description ?? '')
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteGroupTarget(group)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa nhóm
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {group.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={group.createdBy.avatar} />
                  <AvatarFallback>
                    {group.createdBy.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {group.createdBy.name}
                </span>
              </div>
            </div>
          ))}
        {!isLoading && data?.groups.length === 0 && (
          <p className="col-span-full text-center py-10 text-muted-foreground">
            Chưa có nhóm nào
          </p>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {data.page} / {data.totalPages}
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

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo nhóm mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                Tên nhóm <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ví dụ: Kế toán"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Mô tả nhóm..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              disabled={!newGroupName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Tạo nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editGroup}
        onOpenChange={(o) => {
          if (!o) setEditGroup(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tên nhóm</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroup(null)}>
              Hủy
            </Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog
        open={!!deleteGroup}
        onOpenChange={(o) => {
          if (!o) setDeleteGroupTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm "{deleteGroup?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Tất cả thành viên sẽ bị xóa khỏi
              nhóm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteGroup && deleteMutation.mutate(deleteGroup.id)
              }
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Members dialog */}
      <Dialog
        open={!!membersGroupId}
        onOpenChange={(o) => {
          if (!o) {
            setMembersGroupId(null)
            setMemberSearch('')
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quản lý thành viên — {groupDetail?.name}</DialogTitle>
            <DialogDescription>
              Thêm hoặc xóa thành viên khỏi nhóm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Thành viên hiện tại ({groupDetail?.members?.length ?? 0})
              </h4>
              <div className="space-y-2">
                {groupDetail?.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {groupDetail?.members?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có thành viên
                  </p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Thêm thành viên</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm người dùng..."
                  className="pl-9"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {allUsers?.users
                  .filter((u) => !memberIds.has(u.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback>
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => addMemberMutation.mutate(user.id)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Thêm
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
