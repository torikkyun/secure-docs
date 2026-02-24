import { FileText, Image, File, MoreHorizontal, Lock, ExternalLink, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { FileItem } from '../types'

interface FileGridProps {
  files: FileItem[]
  onShare: (file: FileItem) => void
  onDownload: (file: FileItem) => void
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function FileGrid({ files, onShare, onDownload }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.mimeType)

        return (
          <Card key={file.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* File Icon/Thumbnail */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate mb-1" title={file.filename}>
                    {file.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(Number(file.size))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(file.createdAt)}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Mã hóa
                  </Badge>
                  {file.enableBlockchainLogging && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Blockchain
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(file)
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Tải về
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onShare(file)
                    }}
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Chia sẻ
                  </Button>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'sm' }),
                      "h-8 w-8 p-0 self-end opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(file)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Chia sẻ
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem disabled onClick={() => toast.info('Tính năng đang phát triển')}>
                        Đổi tên
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled onClick={() => toast.info('Tính năng đang phát triển')}>
                        Di chuyển
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem disabled className="text-destructive" onClick={() => toast.info('Tính năng đang phát triển')}>
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
