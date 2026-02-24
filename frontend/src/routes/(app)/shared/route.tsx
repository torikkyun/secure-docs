import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getFilesFn } from '@/api/file/functions'
import { FileItem } from '@/api/file/types'
import { DownloadFileModal } from '../files/-components/download-file-modal'
import { SharedFileGrid } from './-components/shared-file-grid'
import { Input } from '@/components/ui/input'
import { Search, Share2, FileText, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/(app)/shared')({
  component: SharedPage,
})

function SharedPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['files', 'shared'],
    queryFn: () => getFilesFn({ data: { filter: 'shared' } }),
  })

  const files: FileItem[] = data?.files || []

  const filteredFiles = files.filter(
    (f) =>
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sharedBy?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDownload = (file: FileItem) => {
    setSelectedFile(file)
    setIsDownloadModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 bg-background/95 backdrop-blur z-20 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Được chia sẻ với tôi
            </h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {files.length} tệp tin từ người khác
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && files.length > 0 && (
            <Badge variant="outline">
              <Share2 className="h-3 w-3 mr-1" />
              {files.length} tệp
            </Badge>
          )}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên tệp hoặc người chia sẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Đang tải tài liệu...</div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-6">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery
                ? 'Không tìm thấy kết quả'
                : 'Chưa có tệp nào được chia sẻ'}
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác.'
                : 'Khi ai đó chia sẻ tệp với bạn, chúng sẽ xuất hiện ở đây.'}
            </p>
          </div>
        ) : (
          <SharedFileGrid files={filteredFiles} onDownload={handleDownload} />
        )}
      </div>

      <DownloadFileModal
        file={selectedFile}
        isOpen={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false)
          setSelectedFile(null)
        }}
      />
    </div>
  )
}
