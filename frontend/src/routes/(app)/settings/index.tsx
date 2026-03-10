import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { KeySyncWarning } from '@/routes/(app)/settings/-components/key-sync-warning'
import { UpdateProfileForm } from '@/routes/(app)/settings/-components/update-profile-form'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/(app)/settings/')({
  component: Settings,
})

function Settings() {
  // const { user } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và bảo mật
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-green-600 bg-green-50 border-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Kết nối an toàn
          </Badge>
        </div>
      </div>

      {/* Key Sync Warning (Only shows if keys are missing/mismatch) */}
      <KeySyncWarning />

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin hiển thị của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}
