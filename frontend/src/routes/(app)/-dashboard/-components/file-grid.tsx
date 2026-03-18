import {
  FileText,
  MoreHorizontal,
  Lock,
  ExternalLink,
  Download,
  Share2,
} from 'lucide-react'
import { getFileIcon } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileItem } from '@/lib/types/files'

interface FileGridProps {
  files: FileItem[]
  onShare: (file: FileItem) => void
  onDownload: (file: FileItem) => void
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
        const { Icon: FileIcon, colorClass } = getFileIcon(file.mimeType)

        return (
          <Card
            key={file.id}
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* File Icon/Thumbnail */}
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
                    {formatFileSize(Number(file.size))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(file.createdAt)}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                  {file.enableBlockchainLogging && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      On-chain
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
                    Download
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
                    Share
                  </Button>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 self-end opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownload(file)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(file)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Move to folder</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
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
