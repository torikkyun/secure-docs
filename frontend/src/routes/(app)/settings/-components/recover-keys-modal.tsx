import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { recoverKeysSchema } from '../-schemas/recover-keys'
import { recoverKeyPairFromMnemonic, encryptPrivateKey } from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { KeyRound } from 'lucide-react'
import { getCurrentUserFn } from '@/api/user/functions'
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'

interface RecoverKeysModalProps {
  serverPublicKey?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function RecoverKeysModal({
  serverPublicKey: propKey,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: RecoverKeysModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen

  const [mnemonic, setMnemonic] = useState('')
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)

  // If propKey is not provided, fetch current user
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
    enabled: !propKey && isOpen,
  })

  const serverPublicKey = propKey || userData?.publicKey

  const recoverMutation = useMutation({
    mutationFn: async (passcode: string) => {
      if (!serverPublicKey) {
        throw new Error('Không tìm thấy khóa công khai từ server')
      }

      // Validate input
      const validation = recoverKeysSchema.safeParse({ mnemonic, passcode })
      if (!validation.success) {
        // Safe access to errors
        const errorMsg = validation.error.flatten().fieldErrors
        const firstError =
          Object.values(errorMsg)[0]?.[0] || 'Dữ liệu không hợp lệ'
        throw new Error(firstError)
      }

      // 1. Generate keys from mnemonic
      const { privateKey, publicKey } = await recoverKeyPairFromMnemonic(
        mnemonic.trim(),
      )

      // 2. Verify public key matches server
      if (publicKey !== serverPublicKey) {
        throw new Error(
          'Mnemonic không khớp với danh tính hiện tại. Vui lòng kiểm tra lại.',
        )
      }

      // 3. Encrypt private key with passcode
      const encryptedPrivateKey = await encryptPrivateKey(privateKey, passcode)

      // 4. Save to localStorage (same format as registration)
      localStorage.setItem('userPublicKey', publicKey)
      localStorage.setItem(
        'encryptedPrivateKey',
        JSON.stringify(encryptedPrivateKey),
      )

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Khôi phục khóa thành công!', {
        description: 'Trang sẽ được tải lại để áp dụng thay đổi.',
      })
      setMnemonic('')
      setShowPasscodeModal(false)
      setIsOpen?.(false)
      // Reload để áp dụng keys mới
      setTimeout(() => window.location.reload(), 1500)
    },
    onError: (err: Error) => {
      toast.error('Khôi phục thất bại', {
        description: err.message,
      })
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (setIsOpen) setIsOpen(open)
    if (!open) {
      setMnemonic('')
      setShowPasscodeModal(false)
      recoverMutation.reset()
    }
  }

  return (
    <>
      <PasscodeConfirmModal
        isOpen={showPasscodeModal}
        onConfirm={(pc) => recoverMutation.mutate(pc)}
        onCancel={() => setShowPasscodeModal(false)}
        isPending={recoverMutation.isPending}
        title="Tạo Passcode mới"
        description="Nhập 6 số passcode mới để mã hóa khóa riêng tư của bạn trên thiết bị này."
      />
      <Dialog
        open={isOpen && !showPasscodeModal}
        onOpenChange={handleOpenChange}
      >
        {trigger ? (
          <DialogTrigger>{trigger}</DialogTrigger>
        ) : !isControlled ? (
          <DialogTrigger className="w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors flex justify-between items-center group">
            <div>
              <div className="font-medium text-sm group-hover:text-primary transition-colors">
                Khôi phục từ Mnemonic
              </div>
              <div className="text-xs text-muted-foreground">
                Nhập 12 từ khóa bí mật
              </div>
            </div>
            <KeyRound className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </DialogTrigger>
        ) : null}

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Khôi phục khóa bảo mật
            </DialogTitle>
            <DialogDescription>
              Nhập 12 từ mnemonic của bạn để khôi phục cặp khóa mã hóa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="mnemonic">12 từ bí mật (Mnemonic)</Label>
              <div className="border rounded-lg p-3 bg-muted/40 hover:border-primary/30 transition-colors">
                <Textarea
                  id="mnemonic"
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="apple banana cat dog ..."
                  className="resize-none font-mono border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md bg-destructive/5 border-destructive/20">
              {/* <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> */}
              <p className="text-sm text-muted-foreground">
                Hành động này sẽ ghi đè khóa hiện tại trong trình duyệt. Đảm bảo
                bạn đang dùng đúng mnemonic của tài khoản này.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen && setIsOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => setShowPasscodeModal(true)}
              disabled={!mnemonic}
              variant="destructive"
              className="min-w-28"
            >
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
