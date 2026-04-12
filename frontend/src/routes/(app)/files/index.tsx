import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { FileText, Loader2, Plus } from 'lucide-react'
import { FileItem } from '@/api/file/types'
import { FileList } from './-components/file-list'
import { FileGrid } from './-components/file-grid'
import { ShareFileModal } from './-components/share-file-modal'
import { DownloadFileModal } from './-components/download-file-modal'
import { ViewFileModal } from './-components/view-file-modal'
import { RevokeShareModal } from './-components/revoke-share-modal'
import { DeleteFileModal } from './-components/delete-file-modal'
import { createFileRoute } from '@tanstack/react-router'
import { getFilesFn } from '@/api/file/functions'
import { useDetailBar } from '../-context/detail-bar-context'

export const Route = createFileRoute('/(app)/files/')({
  component: FilesPage,
})

export function FilesPage() {
  Route.useLoaderData()

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<
    'filename' | 'createdAt' | 'size' | undefined
  >(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const {
    setSelectedFile: setDetailBarFile,
    selectedFile: detailBarFile,
    viewMode,
    fileType,
    classification,
    selectedPerson,
    setKnownPeople,
  } = useDetailBar()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      setDetailBarFile(null)
    }
  }, [])

  // Fetch real files data
  const {
    data: filesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      'files',
      sortBy,
      sortOrder,
      fileType,
      classification,
      selectedPerson?.id,
      selectedPerson?.role,
    ],
    queryFn: ({ pageParam }) =>
      getFilesFn({
        data: {
          sortBy,
          sortOrder,
          page: pageParam,
          limit: 20,
          fileType,
          classification,
          ownerId:
            selectedPerson?.role === 'owner' ? selectedPerson.id : undefined,
          sharedWithId:
            selectedPerson?.role === 'shared' ? selectedPerson.id : undefined,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const files: FileItem[] = filesData?.pages.flatMap((p) => p.files) ?? []

  // Sync detail bar's selected file with the latest query data so that
  // sharedWith / revoke-share option reflects the current state immediately
  // after a share or revoke action invalidates the query.
  useEffect(() => {
    if (!detailBarFile) return
    const updated = files.find((f) => f.id === detailBarFile.id)
    if (updated) setDetailBarFile(updated)
  }, [files])

  // Accumulate unique people seen across all loaded pages (never shrinks)
  useEffect(() => {
    if (!filesData) return
    setKnownPeople((prev) => {
      const next = new Map(prev)
      filesData.pages.forEach((page) => {
        page.files.forEach((file) => {
          const addPerson = (p: {
            id: string
            name: string
            email: string
            avatar: string
          }) => {
            if (p && !next.has(p.id)) {
              next.set(p.id, {
                id: p.id,
                name: p.name,
                email: p.email,
                avatar: p.avatar,
              })
            }
          }
          addPerson(file.owner)
          file.sharedWith?.forEach(addPerson)
        })
      })
      return next
    })
  }, [filesData])

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

  const handleShare = (file: FileItem) => {
    setSelectedFile(file)
    setIsShareModalOpen(true)
  }

  const handleDownload = (file: FileItem) => {
    setSelectedFile(file)
    setIsDownloadModalOpen(true)
  }

  const handleView = (file: FileItem) => {
    setSelectedFile(file)
    setIsViewModalOpen(true)
  }

  const handleRevokeShare = (file: FileItem) => {
    setSelectedFile(file)
    setIsRevokeModalOpen(true)
  }

  const handleDelete = (file: FileItem) => {
    setSelectedFile(file)
    setIsDeleteModalOpen(true)
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
      {/* Main Content Area */}
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
            <h3 className="text-xl font-semibold mb-2">Chưa có tài liệu nào</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Nơi lưu trữ an toàn cho mọi tài liệu của bạn. Hãy bắt đầu bằng
              cách nhấn nút <strong>Mới</strong> ở thanh bên.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Plus className="h-4 w-4" />
              Sử dụng nút "Mới" trên thanh bên để tải tệp
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <FileList
            files={files}
            onShare={handleShare}
            onDownload={handleDownload}
            onView={handleView}
            onRevokeShare={handleRevokeShare}
            onDelete={handleDelete}
            onSelect={setDetailBarFile}
            onSortingChange={handleSortingChange}
          />
        ) : (
          <FileGrid
            files={files}
            onShare={handleShare}
            onDownload={handleDownload}
            onView={handleView}
            onRevokeShare={handleRevokeShare}
            onDelete={handleDelete}
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

      <ViewFileModal
        file={selectedFile}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      <RevokeShareModal
        file={selectedFile}
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
      />

      <DeleteFileModal
        file={selectedFile}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
