import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  decryptPrivateKey,
  deriveSharedSecret,
  deriveWrappingKeyFromSharedSecret,
  wrapAesKey,
  getUserKeys,
  unwrapAesKey,
} from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, X, Check, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'
import { FileItem } from '@/api/file/types'
import { getUsersFn } from '@/api/user/functions'
import { createShareFn, createGroupShareFn } from '@/api/share/functions'
import { getGroupsFn, getGroupByIdFn } from '@/api/group/functions'
import { ShieldAlert, Lock } from 'lucide-react'

interface ShareFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function ShareFileModal({ file, isOpen, onClose }: ShareFileModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>(
    'individual',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [pendingShareMode, setPendingShareMode] = useState<
    'individual' | 'group'
  >('individual')

  const isBlocked =
    file?.classification === 'RESTRICTED' || file?.contentFlag === 'FLAGGED'
  const isConfidential = file?.classification === 'CONFIDENTIAL'

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const result = await getUsersFn({ data: { search: query, limit: 10 } })
      return result.users || []
    },
    onSuccess: (data) => {
      setSearchResults(data)
    },
    onError: () => {
      toast.error('Không thể tìm kiếm người dùng')
    },
  })

  const { data: groupsData } = useQuery({
    queryKey: ['groups', 1],
    queryFn: () => getGroupsFn({ data: { page: 1, limit: 100 } }),
    enabled: isOpen,
  })

  const { data: selectedGroupDetail } = useQuery({
    queryKey: ['groups', selectedGroupId, 'detail'],
    queryFn: () => getGroupByIdFn({ data: { id: selectedGroupId } }),
    enabled: !!selectedGroupId,
  })

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(() => {
      searchMutation.mutate(trimmed)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const shareMutation = useMutation({
    mutationFn: async (passcode: string) => {
      if (!file) throw new Error('Không tìm thấy file')

      const userKeys = getUserKeys()
      if (!userKeys) throw new Error('Không tìm thấy khóa người dùng')

      // 1. Decrypt My Private Key
      let myPrivateKey: string
      try {
        myPrivateKey = await decryptPrivateKey(
          userKeys.encryptedPrivateKey,
          passcode,
        )
      } catch {
        throw new Error('Passcode không đúng')
      }

      // 2. Unwrap File AES Key (using my keys)
      const mySharedSecret = await deriveSharedSecret(
        myPrivateKey,
        userKeys.publicKey,
      )
      const myWrappingKey =
        await deriveWrappingKeyFromSharedSecret(mySharedSecret)

      let aesKey: string
      try {
        aesKey = await unwrapAesKey(file.wrappedAesKey, myWrappingKey)
      } catch {
        throw new Error('Không thể giải mã khóa file (có thể file bị lỗi)')
      }

      const performShare = async (recipients: any[]) => {
        return Promise.all(
          recipients.map(async (selectedUser: any) => {
            const recipientPublicKey = selectedUser.publicKey
            if (!recipientPublicKey) {
              throw new Error(
                `${selectedUser.name} chưa thiết lập khóa công khai`,
              )
            }
            const recipSharedSecret = await deriveSharedSecret(
              myPrivateKey,
              recipientPublicKey,
            )
            const recipWrappingKey =
              await deriveWrappingKeyFromSharedSecret(recipSharedSecret)
            const wrappedAesKeyForRecipient = await wrapAesKey(
              aesKey,
              recipWrappingKey,
            )
            return {
              recipientId: selectedUser.id,
              wrappedAesKey: wrappedAesKeyForRecipient,
            }
          }),
        )
      }

      if (pendingShareMode === 'group') {
        if (!selectedGroupId) throw new Error('Chưa chọn nhóm')
        const members = selectedGroupDetail?.members ?? []
        if (members.length === 0) throw new Error('Nhóm không có thành viên')
        const recipientsData = await performShare(members)
        return createGroupShareFn({
          data: {
            fileId: file.id,
            groupId: selectedGroupId,
            recipients: recipientsData,
          },
        })
      }

      // 3. Prepare wrapped keys for all recipients in parallel
      const recipientsData = await performShare(selectedUsers)

      // 4. Send all shares in a single API call
      return createShareFn({
        data: { fileId: file.id, recipients: recipientsData },
      })
    },
    onSuccess: (data) => {
      const successCount = data.shares?.length || 0
      const warnings = data.warnings || []
      if (warnings.length > 0) {
        toast.warning(`Chia sẻ thành công cho ${successCount} người`, {
          description: `Cảnh báo: ${warnings.join(', ')}`,
        })
      } else {
        toast.success(`Đã chia sẻ thành công cho ${successCount} người`)
      }
      handleClose()
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
    onError: (err) => {
      toast.error(`Lỗi chia sẻ: ${err.message}`)
    },
  })

  const handleClose = () => {
    onClose()
    setShowPasscode(false)
    setSelectedUsers([])
    setSearchQuery('')
    setSearchResults([])
    setSelectedGroupId('')
    setActiveTab('individual')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const handleSelectUser = (user: any) => {
    if (file?.ownerId === user.id) {
      toast.info('Đây là chủ sở hữu file')
      return
    }
    if (selectedUsers.some((u) => u.id === user.id)) {
      toast.info('Người dùng này đã được chọn')
      return
    }
    setSelectedUsers((prev) => [...prev, user])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <>
      <PasscodeConfirmModal
        isOpen={showPasscode}
        onConfirm={(passcode) => shareMutation.mutate(passcode)}
        onCancel={() => setShowPasscode(false)}
        isPending={shareMutation.isPending}
        title="Xác nhận chia sẻ"
        description="Nhập passcode để xác nhận chia sẻ tài liệu."
        confirmLabel="Chia sẻ"
      />
      <Dialog
        open={isOpen && !showPasscode}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ tài liệu</DialogTitle>
            <DialogDescription>
              Chia sẻ{' '}
              <span className="font-medium text-foreground break-all">
                {file?.filename}
              </span>{' '}
              với người dùng khác.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Classification enforcement notices */}
            {isBlocked && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <ShieldAlert className="h-4 w-4 text-red-600!" />
                <AlertDescription className="text-red-800">
                  {file?.contentFlag === 'FLAGGED'
                    ? 'Tài liệu này đã bị đánh dấu cần xem xét (FLAGGED) và không thể chia sẻ.'
                    : 'Tài liệu tối mật (RESTRICTED) không thể chia sẻ.'}
                </AlertDescription>
              </Alert>
            )}
            {!isBlocked && isConfidential && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                <Lock className="h-4 w-4 text-amber-600!" />
                <AlertDescription className="text-amber-800">
                  Tài liệu bảo mật (CONFIDENTIAL) — mọi hoạt động chia sẻ sẽ
                  được ghi nhật ký Blockchain bắt buộc.
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="individual" className="flex-1">
                  Cá nhân
                </TabsTrigger>
                <TabsTrigger value="group" className="flex-1 gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Theo nhóm
                </TabsTrigger>
              </TabsList>

              {/* Individual share tab */}
              <TabsContent value="individual">
                <div
                  className={isBlocked ? 'pointer-events-none opacity-50' : ''}
                >
                  <div className="space-y-2 mt-3">
                    <Label>Thêm người nhận</Label>
                    <div className="relative">
                      <Input
                        placeholder="Nhập email hoặc tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                      />
                      {searchMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-md shadow-sm mt-2 max-h-48 overflow-y-auto bg-popover text-popover-foreground">
                        {searchResults.map((user) => {
                          const isOwner = user.id === file?.ownerId
                          const isSelected = selectedUsers.some(
                            (u) => u.id === user.id,
                          )
                          return (
                            <div
                              key={user.id}
                              className={cn(
                                'flex items-center gap-3 p-2 cursor-pointer hover:bg-muted transition-colors',
                                (isOwner || isSelected) &&
                                  'opacity-50 cursor-not-allowed bg-muted/50',
                              )}
                              onClick={() =>
                                !isOwner &&
                                !isSelected &&
                                handleSelectUser(user)
                              }
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name ?? ''}
                                />
                              </Avatar>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium leading-none truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              {isOwner && (
                                <span className="text-xs text-muted-foreground">
                                  Chủ sở hữu
                                </span>
                              )}
                              {isSelected && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <Label>Đã chọn ({selectedUsers.length})</Label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                        {selectedUsers.map((user) => (
                          <Badge
                            key={user.id}
                            variant="secondary"
                            className="pl-1 pr-2 py-1 h-8 flex items-center gap-2"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {user.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                              <AvatarImage
                                src={user.avatar}
                                alt={user.name ?? ''}
                              />
                            </Avatar>
                            <span className="truncate max-w-30">
                              {user.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(user.id)}
                              className="ml-1 hover:text-destructive focus:outline-none rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Group share tab */}
              <TabsContent value="group">
                <div
                  className={cn(
                    'space-y-3 mt-3',
                    isBlocked && 'pointer-events-none opacity-50',
                  )}
                >
                  <div className="space-y-2">
                    <Label>Chọn nhóm</Label>
                    <Select
                      value={selectedGroupId}
                      onValueChange={(v) => setSelectedGroupId(v ?? '')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm để chia sẻ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {groupsData?.groups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name} ({g._count?.members ?? 0} thành viên)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedGroupId && selectedGroupDetail && (
                    <div className="space-y-2">
                      <Label>
                        Thành viên sẽ nhận (
                        {selectedGroupDetail.members?.length ?? 0})
                      </Label>
                      <div className="border rounded-md max-h-40 overflow-y-auto divide-y">
                        {selectedGroupDetail.members?.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 p-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="text-[10px]">
                                {m.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {m.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {m.email}
                              </p>
                            </div>
                          </div>
                        ))}
                        {selectedGroupDetail.members?.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nhóm chưa có thành viên
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={shareMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={
                isBlocked ||
                (activeTab === 'individual'
                  ? selectedUsers.length === 0
                  : !selectedGroupId ||
                    (selectedGroupDetail?.members?.length ?? 0) === 0) ||
                shareMutation.isPending
              }
              onClick={() => {
                setPendingShareMode(activeTab)
                setShowPasscode(true)
              }}
            >
              {shareMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Chia sẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
