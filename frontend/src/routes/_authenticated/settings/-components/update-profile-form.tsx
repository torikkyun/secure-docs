import { useForm } from '@tanstack/react-form'

import { useQueryClient, useQuery } from '@tanstack/react-query'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getCurrentUserFn, updateProfileFn } from '@/api/user/functions'
import { updateProfileSchema } from '@/api/user/schemas'

export function UpdateProfileForm() {
  const queryClient = useQueryClient()

  // Get current user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
  })

  const form = useForm({
    defaultValues: {
      name: userData?.name || '',
    },
    validators: {
      onChange: updateProfileSchema as any,
    },
    onSubmit: async ({ value }) => {
      const data: any = {}
      if (value.name && value.name !== userData?.name) data.name = value.name

      if (Object.keys(data).length === 0) {
        toast.info('Không có thay đổi nào')
        return
      }

      await updateProfileFn({ data })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      toast.success('Cập nhật thông tin thành công!')
    },
  })

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thông tin...
      </div>
    )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 max-w-md"
    >
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Tên hiển thị</Label>
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Nhập tên của bạn..."
            />
            {field.state.meta.errors ? (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      />

      <div className="flex gap-2">
        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          )}
        />
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Đặt lại
        </Button>
      </div>
    </form>
  )
}
