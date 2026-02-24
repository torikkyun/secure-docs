import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload, FileText } from 'lucide-react'
import { FileItem } from '@/api/file/types'
import { FileList } from './-components/file-list'
import { ShareFileModal } from './-components/share-file-modal'
import { DownloadFileModal } from './-components/download-file-modal'
import { createFileRoute } from '@tanstack/react-router'
import { getFilesFn } from '@/api/file/functions'

export const Route = createFileRoute('/(app)/files')({
  component: FilesPage,
})

export function FilesPage() {
  Route.useLoaderData()

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

  // Fetch real files data
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => getFilesFn({ data: {} }),
  })

  const files: FileItem[] = filesData?.files || []

  const handleShare = (file: FileItem) => {
    setSelectedFile(file)
    setIsShareModalOpen(true)
  }

  const handleDownload = (file: FileItem) => {
    setSelectedFile(file)
    setIsDownloadModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Toolbar Section */}
      <div className="sticky top-0 bg-background/50 backdrop-blur z-20">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tài liệu của tôi
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Đang tải tài liệu...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-6">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có tài liệu nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Nơi lưu trữ an toàn cho mọi tài liệu của bạn. Hãy bắt đầu bằng
              cách nhấn nút <strong>Mới</strong> ở thanh bên.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Upload className="h-4 w-4" />
              Sử dụng nút "Mới" trên thanh bên để tải tệp
            </div>
          </div>
        ) : (
          <FileList
            files={files}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Modals */}
      <ShareFileModal
        file={selectedFile}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <DownloadFileModal
        file={selectedFile}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  )
}
