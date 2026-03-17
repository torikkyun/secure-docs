import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { PasscodeInput } from '@/components/passcode-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, LockKeyhole } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PasscodeConfirmModalProps {
  isOpen: boolean
  onConfirm: (passcode: string) => void
  onCancel: () => void
  isPending?: boolean
  title?: string
  description?: string
  confirmLabel?: string
}

export function PasscodeConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  isPending = false,
  title = 'Xác nhận Passcode',
  description = 'Nhập 6 số passcode để xác nhận thao tác.',
  confirmLabel = 'Xác nhận',
}: PasscodeConfirmModalProps) {
  const form = useForm({
    defaultValues: { passcode: '' },
    onSubmit: ({ value }) => onConfirm(value.passcode),
  })

  useEffect(() => {
    if (!isOpen) form.reset()
  }, [isOpen])

  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="py-4 space-y-3">
            <Label className="text-sm text-muted-foreground block text-center">
              Passcode của bạn
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
              Dùng để giải mã khóa riêng tư của bạn
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
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
                  disabled={passcode.length < 6 || isSubmitting || isPending}
                >
                  {(isSubmitting || isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {confirmLabel}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
