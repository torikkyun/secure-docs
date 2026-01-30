import { createFileRoute } from '@tanstack/react-router'
import { FileActivityPage } from '@/features/_authenticated/file-activity/pages/file-activity-page'

export const Route = createFileRoute('/_authenticated/file-activity')({
  component: FileActivityPage,
})