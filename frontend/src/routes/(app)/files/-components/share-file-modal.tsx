import { useState, useEffect, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
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
import { Loader2, X, Check } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { PasscodeInput } from '@/components/passcode-input'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const form = useForm({
    defaultValues: { passcode: '' },
    onSubmit: async ({ value }) => {
      if (selectedUsers.length === 0) {
        toast.error('Vui lòng chọn ít nhất một người nhận')
        return
      }
      try {
        await shareMutation.mutateAsync(value.passcode)
      } catch {
        // errors handled by onError
      }
    },
  })

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

      // 3. Prepare wrapped keys for all recipients in parallel
      const recipientsData = await Promise.all(
        selectedUsers.map(async (selectedUser) => {
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
    form.reset()
    setSelectedUsers([])
    setSearchQuery('')
    setSearchResults([])
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="space-y-4 py-2">
            {/* Search Users */}
            <div className="space-y-2">
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
                      <span className="truncate max-w-30">{user.name}</span>
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

            {/* Passcode — OTP style */}
            <div className="space-y-3 pt-2 border-t mt-4">
              <Label className="flex items-center gap-1.5">
                Passcode xác nhận
              </Label>
              <form.Field
                name="passcode"
                children={(field) => (
                  <PasscodeInput
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              />
              <p className="text-[10px] text-muted-foreground text-center">
                Nhập 6 số passcode để xác nhận chia sẻ
              </p>
            </div>
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
            <form.Subscribe
              selector={(state) => ({
                passcode: state.values.passcode,
                isSubmitting: state.isSubmitting,
              })}
              children={({ passcode, isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={
                    selectedUsers.length === 0 ||
                    passcode.length < 6 ||
                    isSubmitting ||
                    shareMutation.isPending
                  }
                >
                  {(isSubmitting || shareMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Chia sẻ
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
