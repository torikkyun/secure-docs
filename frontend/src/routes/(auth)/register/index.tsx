import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { generateKeyPair, encryptPrivateKey } from '@/lib/crypto'
import FieldInfo from '@/components/field-info'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Loader2, Mail, User, Lock, CheckCircle2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { registerFn } from '@/api/auth/functions'
import { registerInfoFormSchema } from '@/api/auth/schemas'
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'

export const Route = createFileRoute('/(auth)/register/')({
  component: Register,
})

function Register() {
  const [showPasscodeModal, setShowPasscodeModal] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showMnemonicDialog, setShowMnemonicDialog] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>('')
  const [pendingValues, setPendingValues] = useState<{
    email: string
    password: string
    name: string
  } | null>(null)

  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    validators: {
      onChange: registerInfoFormSchema,
    },
    onSubmit: async ({ value }) => {
      setPendingValues(value)
      setShowPasscodeModal(true)
    },
  })

  const handlePasscodeConfirm = async (passcode: string) => {
    if (!pendingValues) return
    setIsRegistering(true)
    try {
      const keyPair = await generateKeyPair()
      const encryptedPrivateKey = await encryptPrivateKey(
        keyPair.privateKey,
        passcode,
      )

      localStorage.setItem('userPublicKey', keyPair.publicKey)
      localStorage.setItem(
        'encryptedPrivateKey',
        JSON.stringify(encryptedPrivateKey),
      )

      await registerFn({
        data: {
          ...pendingValues,
          passcode,
          publicKey: keyPair.publicKey,
        },
      })

      setShowPasscodeModal(false)
      setMnemonic(keyPair.mnemonic)
      setShowMnemonicDialog(true)
    } catch (error: { message: string } | any) {
      toast.error(`Lỗi: ${error.message}`)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic)
    toast.success('Đã sao chép vào bộ nhớ tạm')
  }

  const handleFinish = () => {
    setShowMnemonicDialog(false)
    router.navigate({ to: '/files' })
  }

  return (
    <>
      <div className="w-full space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-muted-foreground">
            Tạo tài khoản mới để bắt đầu chia sẻ tài liệu an toàn.
          </p>
        </div>

        <Separator />

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Email
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="name@example.com"
                  />
                </InputGroup>
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Họ tên
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <User className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </InputGroup>
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••"
                  />
                </InputGroup>
                <FieldInfo field={field} />
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="submit"
                className="w-full text-base font-medium py-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            )}
          />

          <div className="text-center text-sm">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
      <PasscodeConfirmModal
        isOpen={showPasscodeModal}
        onConfirm={handlePasscodeConfirm}
        onCancel={() => setShowPasscodeModal(false)}
        isPending={isRegistering}
        title="Tạo Passcode"
        description="Nhập 6 chữ số passcode. Passcode này sẽ dùng để mã hóa khóa riêng tư của bạn. Hãy ghi nhớ và giữ bí mật."
        confirmLabel="Đăng ký"
      />

      <Dialog open={showMnemonicDialog} onOpenChange={setShowMnemonicDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-xl">
              Đăng ký & Khởi tạo khóa thành công!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Dưới đây là 12 từ khóa bí mật (Mnemonic) dùng để tái tạo cặp khóa
              bảo mật (X25519) và khôi phục danh tính của bạn.
              <br />
              <br />
              <span className="font-semibold text-destructive">
                QUAN TRỌNG: Hệ thống không lưu trữ chuỗi này. Nếu mất, bạn sẽ
                vĩnh viễn mất quyền truy cập tài khoản.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-lg bg-muted/50 p-4 border relative group">
            <Button
              size="icon-xs"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopyMnemonic}
              title="Sao chép"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {mnemonic.split(' ').map((word, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 rounded border bg-background px-2 py-1.5 text-sm"
                >
                  <span className="w-5 select-none text-xs text-muted-foreground nums font-mono">
                    {index + 1}.
                  </span>
                  <span className="font-medium select-all">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={handleFinish}
              className="w-full sm:w-auto min-w-37.5"
            >
              Tôi đã lưu, tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
