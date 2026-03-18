import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Loader2 } from 'lucide-react'
import { FileItem } from '@/api/file/types'
import { getFilesFn } from '@/api/file/functions'
import { DownloadFileModal } from '../files/-components/download-file-modal'
import { ViewFileModal } from '../files/-components/view-file-modal'
import { SharedFileList } from './-components/shared-file-list'
import { SharedFileGrid } from './-components/shared-file-grid'
import { useDetailBar } from '../route'

export const Route = createFileRoute('/(app)/shared/')({
  component: SharedPage,
})

function SharedPage() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<
    'filename' | 'createdAt' | 'size' | undefined
  >(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { setSelectedFile: setDetailBarFile, viewMode } = useDetailBar()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      setDetailBarFile(null)
    }
  }, [])

  const {
    data: filesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['files', 'shared', sortBy, sortOrder],
    queryFn: ({ pageParam }) =>
      getFilesFn({
        data: {
          filter: 'shared',
          sortBy,
          sortOrder,
          page: pageParam,
          limit: 20,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const files: FileItem[] = filesData?.pages.flatMap((p) => p.files) ?? []

  const onSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onSentinel, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onSentinel])

  const handleDownload = (file: FileItem) => {
    setSelectedFile(file)
    setIsDownloadModalOpen(true)
  }

  const handleView = (file: FileItem) => {
    setSelectedFile(file)
    setIsViewModalOpen(true)
  }

  const handleSortingChange = (
    newSortBy: string | undefined,
    newSortOrder: 'asc' | 'desc',
  ) => {
    setSortBy(newSortBy as 'filename' | 'createdAt' | 'size' | undefined)
    setSortOrder(newSortOrder)
  }

  return (
    <div className="flex flex-col">
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Đang tải tài liệu...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-muted/30 p-6 rounded-full mb-4">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Chưa có tệp nào được chia sẻ
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Khi ai đó chia sẻ tệp với bạn, chúng sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <SharedFileList
            files={files}
            onDownload={handleDownload}
            onView={handleView}
            onSelect={setDetailBarFile}
            onSortingChange={handleSortingChange}
          />
        ) : (
          <SharedFileGrid
            files={files}
            onDownload={handleDownload}
            onView={handleView}
            onSelect={setDetailBarFile}
          />
        )}
      </div>

      {/* Infinite scroll sentinel + bottom loader */}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <DownloadFileModal
        file={selectedFile}
        isOpen={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false)
          setSelectedFile(null)
        }}
      />

      <ViewFileModal
        file={selectedFile}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedFile(null)
        }}
      />
    </div>
  )
}
