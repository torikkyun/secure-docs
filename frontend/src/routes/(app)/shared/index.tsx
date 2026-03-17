import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getFilesFn } from '@/api/file/functions'
import { FileItem } from '@/api/file/types'
import { DownloadFileModal } from '../files/-components/download-file-modal'
import { SharedFileGrid } from './-components/shared-file-grid'
import { Input } from '@/components/ui/input'
import { Search, Share2, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/(app)/shared/')({
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
