import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  Shield,
  Lock,
  Share2,
  DatabaseZap,
  KeyRound,
  LockKeyhole,
} from 'lucide-react'

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

const features = [
  {
    icon: Lock,
    title: 'Mã hóa đầu cuối (E2E)',
    description: 'Tài liệu được mã hóa trước khi rời khỏi thiết bị của bạn.',
  },
  {
    icon: Share2,
    title: 'Chia sẻ có kiểm soát',
    description: 'Phân quyền chi tiết: xem, tải, chỉnh sửa cho từng người.',
  },
  {
    icon: DatabaseZap,
    title: 'Nhật ký Blockchain bất biến',
    description: 'Mọi thao tác được ghi nhận minh bạch, không thể giả mạo.',
  },
  {
    icon: KeyRound,
    title: 'Mật mã hóa khóa công khai X25519',
    description: 'Chỉ chủ sở hữu khóa riêng tư mới có thể giải mã tài liệu.',
  },
]

function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden p-10"
        style={{
          background:
            'linear-gradient(135deg, oklch(0.35 0.20 277) 0%, oklch(0.25 0.18 290) 40%, oklch(0.18 0.14 280) 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'oklch(0.65 0.25 277)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'oklch(0.55 0.22 240)' }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Secure Docs
          </span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Quản lý & chia sẻ tài liệu an toàn tuyệt đối
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              Nền tảng bảo mật tài liệu thế hệ mới — kết hợp mật mã học hiện đại
              và công nghệ chuỗi khối.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} Secure Docs. Mọi quyền được bảo lưu.
        </p>
      </div>

      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-6 sm:p-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, oklch(0.75 0.06 277 / 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'oklch(0.51 0.23 277)' }}
        />

        <div className="mb-8 flex w-full max-w-sm items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Secure Docs
          </span>
        </div>

        <div className="relative w-full max-w-sm">
          <Outlet />
        </div>

        <div className="relative mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LockKeyhole className="h-3 w-3" />
          <span>Kết nối SSL · Dữ liệu được bảo vệ E2E</span>
        </div>
      </div>
    </div>
  )
}
