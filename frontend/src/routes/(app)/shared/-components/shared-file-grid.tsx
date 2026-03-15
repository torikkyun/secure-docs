import { Download, Lock } from 'lucide-react'
import { getFileIcon, formatFileSize, formatDate } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileItem } from '@/api/file/types'

interface SharedFileGridProps {
  files: FileItem[]
  onDownload: (file: FileItem) => void
}

export function SharedFileGrid({ files, onDownload }: SharedFileGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const { Icon: FileIcon, colorClass } = getFileIcon(file.mimeType)
        const sharedBy = file.sharedBy

        return (
          <Card
            key={file.id}
            className="group hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* File Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileIcon className={cn('h-8 w-8', colorClass)} />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-medium text-sm truncate mb-1"
                    title={file.filename}
                  >
                    {file.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(Number(file.size))} ·{' '}
                    {formatDate(file.createdAt)}
                  </p>
                </div>

                {/* Shared By */}
                {sharedBy && (
                  <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1.5">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {sharedBy.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                        Chia sẻ bởi
                      </p>
                      <p className="text-xs font-medium truncate">
                        {sharedBy.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Badge */}
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 w-fit"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Mã hóa đầu cuối
                </Badge>

                {/* Download Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDownload(file)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Tải xuống
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
