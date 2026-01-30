import { createFileRoute } from '@tanstack/react-router'
import { SharedFilesPage } from '@/features/_authenticated/shared/pages/shared-files-page'

export const Route = createFileRoute('/_authenticated/shared')({
  component: SharedFilesPage,
})