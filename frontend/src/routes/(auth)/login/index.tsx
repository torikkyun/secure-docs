import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import FieldInfo from '@/components/field-info'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { loginFn } from '@/api/auth/functions'
import { loginSchema } from '@/api/auth/schemas'

export const Route = createFileRoute('/(auth)/login/')({
  component: Login,
})

function Login() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginFn({ data: value })
        toast.success('Đăng nhập thành công!')
        router.navigate({ to: '/files' })
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`)
      }
    },
  })

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Nhập email và mật khẩu để truy cập tài khoản của bạn.
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
          name="password"
          children={(field) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
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
                  placeholder="••••••••"
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
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          )}
        />

        <div className="text-center text-sm">
          Bạn chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  )
}
