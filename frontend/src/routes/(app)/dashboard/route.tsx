import { ComingSoon } from '@/components/coming-soon'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return <ComingSoon />
}
