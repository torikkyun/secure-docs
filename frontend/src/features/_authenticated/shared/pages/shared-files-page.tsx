import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Route } from '@/routes/_authenticated/route'
import { getSharedFilesFn } from '../functions'
import { FileGrid } from '../../files/components/file-grid'
import { FileList } from '../../files/components/file-list'
import { DownloadFileModal } from '../../files/components/download-file-modal'
import { FileItem } from '../../files/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Grid3X3,
  List,
  Search,
  FileText,
} from 'lucide-react'

export function SharedFilesPage() {
  Route.useLoaderData()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

  // Fetch real shared files data
  const { data: sharedFilesData, isLoading } = useQuery({
    queryKey: ['shared-files'],
    queryFn: () => getSharedFilesFn(),
  })

  const sharedFiles: FileItem[] = sharedFilesData?.files || []

  // Filter files based on search and type
  const filteredFiles = sharedFiles.filter((file) => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.sharedBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' ||
      (filterType === 'documents' && file.mimeType.includes('document')) ||
      (filterType === 'images' && file.mimeType.startsWith('image/')) ||
      (filterType === 'archives' && file.mimeType.includes('zip'))
    return matchesSearch && matchesType
  })

  const handleDownload = (file: FileItem) => {
    setSelectedFile(file)
    setIsDownloadModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Toolbar Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 bg-background/95 backdrop-blur z-20 pb-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Được chia sẻ với tôi</h1>
          <Badge variant="outline" className="ml-2">
            {filteredFiles.length} mục
          </Badge>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search */}
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Tìm kiếm tài liệu được chia sẻ..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1"
             />
          </div>

          {/* Filter Type */}
          <Select value={filterType} onValueChange={(val) => setFilterType(val || 'all')} disabled>
             <SelectTrigger className="w-[140px] h-10 border-none bg-muted/50">
               <SelectValue placeholder="Loại tệp" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Tất cả</SelectItem>
               <SelectItem value="documents">Tài liệu</SelectItem>
               <SelectItem value="images">Hình ảnh</SelectItem>
               <SelectItem value="archives">Tệp nén</SelectItem>
             </SelectContent>
          </Select>

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
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
               <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Không có tài liệu nào</h3>
            <p className="max-w-sm mt-1">
               {searchQuery
                 ? 'Không tìm thấy kết quả phù hợp.'
                 : 'Các tài liệu được chia sẻ với bạn sẽ xuất hiện ở đây.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="pb-8">
            <FileGrid
              files={filteredFiles}
              onShare={() => {}} // No re-share for now
              onDownload={handleDownload}
            />
          </div>
        ) : (
          <div className="pb-8">
            <FileList
              files={filteredFiles}
              onShare={() => {}} // No re-share for now
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DownloadFileModal
        file={selectedFile}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  )
}
