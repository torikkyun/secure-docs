import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/features/_authenticated/settings/pages/settings'

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
})
