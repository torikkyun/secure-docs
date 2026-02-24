import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Loader2, Search, User, X, Check, LockKeyhole } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileItem } from '@/api/file/types'
import { getUsersFn } from '@/api/user/functions'
import { createShareFn } from '@/api/share/functions'

interface ShareFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function ShareFileModal({ file, isOpen, onClose }: ShareFileModalProps) {
  const queryClient = useQueryClient()
  const [passcode, setPasscode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])

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

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!file || selectedUsers.length === 0 || !passcode) {
        throw new Error('Vui lòng chọn người nhận và nhập passcode')
      }

      const userKeys = getUserKeys()
      if (!userKeys) throw new Error('Không tìm thấy khóa người dùng')

      // 1. Decrypt My Private Key
      let myPrivateKey: string
      try {
        myPrivateKey = await decryptPrivateKey(
          userKeys.encryptedPrivateKey,
          passcode,
        )
      } catch (e) {
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
      } catch (e) {
        throw new Error('Không thể giải mã khóa file (có thể file bị lỗi)')
      }

      // 3. Prepare wrapped keys for all recipients in parallel
      const recipientsData = await Promise.all(
        selectedUsers.map(async (selectedUser) => {
          // Use publicKey from selected user (already fetched from search)
          const recipientPublicKey = selectedUser.publicKey

          if (!recipientPublicKey) {
            throw new Error(
              `${selectedUser.name} chưa thiết lập khóa công khai`,
            )
          }

          // Wrap AES Key for this Recipient
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

      // 4. Send all shares in a single API call
      return createShareFn({
        data: {
          fileId: file.id,
          recipients: recipientsData,
        },
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
    setPasscode('')
    setSelectedUsers([])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery)
    }
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
          {/* Search Users */}
          <div className="space-y-2">
            <Label>Thêm người nhận</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending || !searchQuery.trim()}
                size="icon"
                variant="secondary"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-md shadow-sm mt-2 max-h-48 overflow-y-auto bg-popover text-popover-foreground">
                {searchResults.map((user) => {
                  const isOwner = user.id === file?.ownerId
                  const isSelected = selectedUsers.some((u) => u.id === user.id)

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted transition-colors ${
                        isOwner || isSelected
                          ? 'opacity-50 cursor-not-allowed bg-muted/50'
                          : ''
                      }`}
                      onClick={() =>
                        !isOwner && !isSelected && handleSelectUser(user)
                      }
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
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
            <div className="space-y-2">
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
                    </Avatar>
                    <span className="truncate max-w-[120px]">{user.name}</span>
                    <button
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

          {/* Passcode Confirmation */}
          <div className="space-y-2 pt-2 border-t mt-4">
            <Label
              htmlFor="passcode"
              className="flex justify-between items-center"
            >
              <span>Passcode xác nhận</span>
              <LockKeyhole className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input
              id="passcode"
              type="password"
              placeholder="******"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              maxLength={6}
              className="text-center tracking-widest text-lg font-mono h-12"
            />
            <p className="text-[10px] text-muted-foreground">
              Dùng để ký số và chia sẻ khóa bảo mật
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
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
            onClick={() => shareMutation.mutate()}
            disabled={
              selectedUsers.length === 0 || !passcode || shareMutation.isPending
            }
          >
            {shareMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Chia sẻ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
