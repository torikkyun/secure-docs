import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserFn } from '@/api/user/functions'
import { uploadAvatarFn } from '@/api/user/functions'
import { UpdateProfileForm } from '@/routes/(app)/settings/-components/update-profile-form'
import { GeminiApiKeyForm } from '@/routes/(app)/settings/-components/gemini-api-key-form'
import { RecoverKeysModal } from '@/routes/(app)/settings/-components/recover-keys-modal'
import { createFileRoute } from '@tanstack/react-router'
import {
  User,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Mail,
  AtSign,
  Camera,
  Loader2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRef } from 'react'
import { getAvatarUrl } from '@/lib/avatar-utils'

export const Route = createFileRoute('/(app)/settings/')({
  component: Settings,
})

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 w-64 lg:w-80 shrink-0">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border shadow-sx bg-background text-foreground shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="pt-1.5 pr-2">
        <h3 className="text-sm font-semibold leading-none tracking-tight">
          {title}
        </h3>
        <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

function Settings() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserFn,
  })

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return uploadAvatarFn({ data: formData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      toast.success('Cập nhật ảnh đại diện thành công!')
    },
    onError: (err: any) => {
      toast.error(`Lỗi: ${err.message}`)
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }
    avatarMutation.mutate(file)
    e.target.value = ''
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.email?.substring(0, 2).toUpperCase() ?? '?')

  return (
    <div className="max-w-5xl space-y-1">
      {/* ── Account Overview ─────────────────────── */}
      <div className="flex flex-row items-start gap-5 lg:gap-8 py-6">
        <SectionHeader
          icon={AtSign}
          title="Tài khoản"
          description="Thông tin tài khoản của bạn"
        />
        <div className="flex-1 flex items-center gap-4 p-4 rounded-xl border shadow-sm bg-card hover:shadow-md transition-shadow min-w-0">
          {/* Clickable avatar */}
          <button
            type="button"
            className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
            aria-label="Thay đổi ảnh đại diện"
          >
            <Avatar className="h-12 w-12 border-2 border-background shadow">
              <AvatarImage
                src={getAvatarUrl(user?.avatar)}
                alt={user?.name ?? ''}
              />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-disabled:opacity-100 transition-opacity">
              {avatarMutation.isPending ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-semibold truncate">
              {user?.name || '—'}
            </p>
            <div className="flex items-center gap-1 mt-1 opacity-90">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-[13px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          {user?.role?.name && (
            <Badge
              variant="secondary"
              className="capitalize shrink-0 text-[10px] px-2 py-0.5"
            >
              {user.role.name}
            </Badge>
          )}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* ── Profile ──────────────────────────────── */}
      <div className="flex flex-row items-start gap-5 lg:gap-8 py-6">
        <SectionHeader
          icon={User}
          title="Thông tin cá nhân"
          description="Cập nhật tên hiển thị của bạn"
        />
        <div className="flex-1 min-w-0">
          <UpdateProfileForm />
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* ── Security / Key recovery ───────────────── */}
      <div className="flex flex-row items-start gap-5 lg:gap-8 py-6">
        <SectionHeader
          icon={ShieldCheck}
          title="Bảo mật & Khóa mã hóa"
          description="Khôi phục khóa từ mnemonic khi đổi thiết bị hoặc trình duyệt"
        />
        <div className="flex-1 space-y-4 min-w-0">
          <div className="rounded-xl border shadow-sm bg-card p-4 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold tracking-tight">
                  Khóa mã hóa (E2E)
                </p>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Khóa riêng tư được mã hóa bởi passcode và lưu cục bộ. Dùng
                  mnemonic để khôi phục trên thiết bị khác.
                </p>
                <div className="mt-2.5">
                  <RecoverKeysModal
                    trigger={
                      <button className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                        Khôi phục khóa từ Mnemonic{' '}
                        <span aria-hidden="true">&rarr;</span>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* ── Gemini AI ─────────────────────────────── */}
      <div className="flex flex-row items-start gap-5 lg:gap-8 py-6">
        <SectionHeader
          icon={Sparkles}
          title="Gemini AI"
          description="API key để phân loại tài liệu PDF tự động khi tải lên"
        />
        <div className="flex-1 min-w-0">
          <GeminiApiKeyForm />
        </div>
      </div>
    </div>
  )
}
