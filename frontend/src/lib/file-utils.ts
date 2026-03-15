import { FileText, Image, File, FileSpreadsheet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function getFileIcon(mimeType: string): {
  Icon: LucideIcon
  colorClass: string
} {
  if (mimeType.startsWith('image/'))
    return { Icon: Image, colorClass: 'text-violet-500' }
  if (mimeType === 'application/pdf')
    return { Icon: FileText, colorClass: 'text-red-500' }
  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  )
    return { Icon: FileText, colorClass: 'text-blue-600' }
  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  )
    return { Icon: FileSpreadsheet, colorClass: 'text-green-600' }
  return { Icon: File, colorClass: 'text-muted-foreground' }
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
