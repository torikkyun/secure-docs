import { createFileRoute } from '@tanstack/react-router'
import { FilesPage } from '@/features/_authenticated/files/pages/files-page'

export const Route = createFileRoute('/_authenticated/files')({
  component: FilesPage,
})
