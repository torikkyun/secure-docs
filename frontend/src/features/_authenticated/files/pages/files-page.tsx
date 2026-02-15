import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Route } from '@/routes/_authenticated/route'
import { getUserFilesFn } from '../functions'
import { FileGrid } from '../components/file-grid'
import { FileList } from '../components/file-list'
import { UploadFileForm } from '../components/upload-file-form'
import { ShareFileModal } from '../components/share-file-modal'
import { DownloadFileModal } from '../components/download-file-modal'
import { FileItem } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Badge } from '@/components/ui/badge'
import {
  Grid3X3,
  List,
  Search,
  Plus,
  Upload,
  FileText,
} from 'lucide-react'

export function FilesPage() {
  Route.useLoaderData()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false)

  // Fetch real files data
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => getUserFilesFn(),
  })

  const files: FileItem[] = filesData?.files || []

  // Filter files based on search
  const filteredFiles = files.filter((file) => {
    return file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  })

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 bg-background/95 backdrop-blur z-20 pb-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Tài liệu của tôi</h1>
          {/* <Badge variant="outline" className="ml-2">
            {filteredFiles.length} mục
          </Badge> */}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search */}
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Tìm kiếm trong Secure Docs..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1"
             />
          </div>



          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
             <Button
               variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
               size="icon-sm"
               onClick={() => setViewMode('grid')}
               className="h-8 w-8"
               title="Lưới"
             >
               <Grid3X3 className="h-4 w-4" />
             </Button>
             <Button
               variant={viewMode === 'list' ? 'secondary' : 'ghost'}
               size="icon-sm"
               onClick={() => setViewMode('list')}
               className="h-8 w-8"
               title="Danh sách"
             >
               <List className="h-4 w-4" />
             </Button>
          </div>

          {/* Upload Button */}
          <Button onClick={() => setIsUploadFormOpen(true)} className="ml-2 shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Mới
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
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
            <h3 className="text-xl font-semibold mb-2">Chưa có tài liệu nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? 'Không tìm thấy kết quả phù hợp với bộ lọc của bạn.'
                : 'Nơi lưu trữ an toàn cho mọi tài liệu của bạn. Hãy bắt đầu bằng cách tải lên tệp tin mới.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsUploadFormOpen(true)} size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Tải tệp lên
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <FileGrid
            files={filteredFiles}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        ) : (
          <FileList
            files={filteredFiles}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Modals */}
      {isUploadFormOpen && (
        <UploadFileForm onClose={() => setIsUploadFormOpen(false)} />
      )}

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
