import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserX, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'
import { FileItem } from '@/api/file/types'
import { revokeShareFn } from '@/api/share/functions'
import { decryptPrivateKey, getUserKeys } from '@/lib/crypto'

interface RevokeShareModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function RevokeShareModal({
  file,
  isOpen,
  onClose,
}: RevokeShareModalProps) {
  const queryClient = useQueryClient()
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(
    null,
  )
  const [showPasscode, setShowPasscode] = useState(false)

  const revokeMutation = useMutation({
    mutationFn: async ({
      recipientId,
      passcode,
    }: {
      recipientId: string
      passcode: string
    }) => {
      if (!file) throw new Error('Không tìm thấy file')

      // Verify passcode by attempting to decrypt the private key
      const userKeys = getUserKeys()
      if (!userKeys) throw new Error('Không tìm thấy khóa người dùng')

      try {
        await decryptPrivateKey(userKeys.encryptedPrivateKey, passcode)
      } catch {
        throw new Error('Passcode không đúng')
      }

      return revokeShareFn({ data: { fileId: file.id, recipientId } })
    },
    onSuccess: (data) => {
      toast.success(
        `Đã thu hồi quyền truy cập của ${data.revokedUser.name || data.revokedUser.email}`,
      )
      handleClose()
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
    onError: (err) => {
      toast.error(`Lỗi: ${err.message}`)
    },
  })

  const handleRevokeClick = (recipientId: string) => {
    setPendingRecipientId(recipientId)
    setShowPasscode(true)
  }

  const handlePasscodeConfirm = (passcode: string) => {
    if (!pendingRecipientId) return
    revokeMutation.mutate({ recipientId: pendingRecipientId, passcode })
  }

  const handlePasscodeCancel = () => {
    setShowPasscode(false)
    setPendingRecipientId(null)
  }

  const handleClose = () => {
    setShowPasscode(false)
    setPendingRecipientId(null)
    onClose()
  }

  const sharedWith = file?.sharedWith ?? []

  return (
    <>
      <PasscodeConfirmModal
        isOpen={showPasscode}
        onConfirm={handlePasscodeConfirm}
        onCancel={handlePasscodeCancel}
        isPending={revokeMutation.isPending}
        title="Xác nhận thu hồi quyền truy cập"
        description="Nhập passcode để xác nhận thu hồi quyền truy cập tài liệu."
        confirmLabel="Thu hồi"
      />

      <Dialog
        open={isOpen && !showPasscode}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thu hồi quyền truy cập</DialogTitle>
            <DialogDescription>
              Chọn người dùng để thu hồi quyền truy cập vào{' '}
              <span className="font-medium text-foreground break-all">
                {file?.filename}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {sharedWith.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Tài liệu này chưa được chia sẻ với ai.
              </p>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {sharedWith.map((person) => {
                  const initials =
                    (person.name || person.email)
                      ?.substring(0, 2)
                      .toUpperCase() ?? '?'
                  const isRevoking =
                    revokeMutation.isPending && pendingRecipientId === person.id

                  return (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={person.avatar} alt={person.name} />
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {person.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleRevokeClick(person.id)}
                        disabled={revokeMutation.isPending}
                      >
                        {isRevoking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                        <span className="ml-1">Thu hồi</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
