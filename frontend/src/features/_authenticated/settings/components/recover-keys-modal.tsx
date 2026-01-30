import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { recoverKeysSchema } from '../schemas'
import { recoverKeyPairFromMnemonic, encryptPrivateKey } from '@/lib/crypto'
import { getCurrentUserFn } from '../../functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2, KeyRound, AlertTriangle } from 'lucide-react'

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
  trigger
}: RecoverKeysModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen

  const [mnemonic, setMnemonic] = useState('')
  const [passcode, setPasscode] = useState('')

  // If propKey is not provided, fetch current user
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
    enabled: !propKey && isOpen,
  })

  const serverPublicKey = propKey || userData?.publicKey

  const recoverMutation = useMutation({
    mutationFn: async () => {
      if (!serverPublicKey) {
        throw new Error('Không tìm thấy khóa công khai từ server')
      }

      // Validate input
      const validation = recoverKeysSchema.safeParse({ mnemonic, passcode })
      if (!validation.success) {
        // Safe access to errors
        const errorMsg = validation.error.flatten().fieldErrors
        const firstError = Object.values(errorMsg)[0]?.[0] || 'Dữ liệu không hợp lệ'
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
      setPasscode('')
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
      setPasscode('')
      recoverMutation.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger className="w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors flex justify-between items-center group">
          <div>
            <div className="font-medium text-sm group-hover:text-primary transition-colors">Khôi phục từ Mnemonic</div>
            <div className="text-xs text-muted-foreground">Nhập 12 từ khóa bí mật</div>
          </div>
          <KeyRound className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Khôi phục khóa bảo mật
          </DialogTitle>
          <DialogDescription>
            Nhập 12 từ mnemonic của bạn để khôi phục cặp khóa mã hóa.
            Hành động này sẽ ghi đè khóa hiện tại trong trình duyệt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mnemonic">12 từ bí mật (Mnemonic)</Label>
            <Textarea
              id="mnemonic"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="apple banana cat dog ..."
              className="resize-none font-mono"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="passcode">Tạo Passcode mới</Label>
              <span className="text-xs text-muted-foreground">6 chữ số</span>
            </div>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              maxLength={6}
              placeholder="******"
              className="text-center font-mono tracking-widest text-lg"
            />
            <p className="text-[10px] text-muted-foreground">
              Passcode này dùng để mã hóa khóa riêng tư của bạn trên thiết bị này.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setIsOpen && setIsOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            onClick={() => recoverMutation.mutate()}
            disabled={!mnemonic || !passcode || recoverMutation.isPending}
            variant="destructive"
          >
            {recoverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận khôi phục'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
