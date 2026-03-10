import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import FieldInfo from '@/components/field-info'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      setIsSubmitting(true)
      try {
        await loginFn({ data: value })
        toast.success('Đăng nhập thành công!')
        router.navigate({ to: '/dashboard' })
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4 dark:bg-gray-900/50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-base">
            Nhập email và mật khẩu để truy cập tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <CardContent className="space-y-5">
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
          </CardContent>
          <CardFooter className="pt-2 mt-5 block">
            <Button
              type="submit"
              className="w-full text-base font-medium py-5 mb-4"
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
            <div className="w-full text-center text-sm">
              Bạn chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
