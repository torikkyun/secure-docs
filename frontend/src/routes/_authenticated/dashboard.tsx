import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: () => <ComingSoon title="Dashboard đang phát triển" description="Trang tổng quan sẽ sớm ra mắt với các tính năng thống kê mạnh mẽ." />,
})
