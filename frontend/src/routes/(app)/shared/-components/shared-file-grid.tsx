import { MoreHorizontal, Download, Eye, Info } from 'lucide-react'
import { getFileIcon, formatDate } from '@/lib/file-utils'
import { useState, useRef, useEffect } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileItem } from '@/api/file/types'
import { useDetailBar } from '@/routes/(app)/route'

interface SharedFileGridProps {
  files: FileItem[]
  onDownload: (file: FileItem) => void
  onView: (file: FileItem) => void
  onSelect?: (file: FileItem | null) => void
}

interface SharedFileCardProps {
  file: FileItem
  isSelected: boolean
  onClick: () => void
  onDownload: (file: FileItem) => void
  onView: (file: FileItem) => void
  onOpenDetail: (file: FileItem) => void
}

function SharedFileCard({
  file,
  isSelected,
  onClick,
  onDownload,
  onView,
  onOpenDetail,
}: SharedFileCardProps) {
  const { Icon: FileIcon, colorClass } = getFileIcon(file.mimeType)
  const person = file.sharedBy
  const initials = person?.name
    ? person.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (person?.email?.substring(0, 2).toUpperCase() ?? '?')

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          className={cn(
            'group relative flex flex-col rounded-xl border bg-background cursor-pointer',
            'transition-all hover:shadow-md',
            isSelected && 'border-primary ring-1 ring-primary bg-primary/5',
          )}
        >
          {/* Thumbnail / Icon area */}
          <div className="flex items-center justify-center h-32 rounded-t-xl bg-muted/40 border-b relative overflow-hidden">
            <FileIcon className={cn('h-14 w-14', colorClass)} />
            {/* Hover actions */}
            <div
              className={cn(
                'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'icon' }),
                    'h-7 w-7 shadow-sm',
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Mở menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-54">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onOpenDetail(file)}>
                      <Info className="h-4 w-4" />
                      Thông tin chi tiết
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {file.mimeType === 'application/pdf' && (
                      <DropdownMenuItem onClick={() => onView(file)}>
                        <Eye className="h-4 w-4" />
                        Xem
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload(file)}>
                      <Download className="h-4 w-4" />
                      Tải xuống
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Info area */}
          <div className="flex flex-col gap-1 p-3">
            <p className="text-sm font-medium truncate" title={file.filename}>
              {file.filename}
            </p>
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarImage src={person?.avatar} alt={person?.name ?? ''} />
                <AvatarFallback className="text-[8px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {person?.name ?? '—'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70">
              {formatDate(file.createdAt)}
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-54">
        <ContextMenuItem onClick={() => onOpenDetail(file)}>
          <Info className="h-4 w-4" />
          Thông tin chi tiết
        </ContextMenuItem>
        <ContextMenuSeparator />
        {file.mimeType === 'application/pdf' && (
          <ContextMenuItem onClick={() => onView(file)}>
            <Eye className="h-4 w-4" />
            Xem
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => onDownload(file)}>
          <Download className="h-4 w-4" />
          Tải xuống
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function SharedFileGrid({
  files,
  onDownload,
  onView,
  onSelect,
}: SharedFileGridProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const {
    isOpen: isDetailBarOpen,
    toggle: toggleDetailBar,
    setSelectedFile,
  } = useDetailBar()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setSelectedFileId(null)
        setSelectedFile(null)
        onSelect?.(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onSelect, setSelectedFile])

  const handleCardClick = (file: FileItem) => {
    if (isDetailBarOpen) {
      setSelectedFileId(file.id)
      setSelectedFile(file)
      return
    }
    const isAlreadySelected = selectedFileId === file.id
    setSelectedFileId(isAlreadySelected ? null : file.id)
    onSelect?.(isAlreadySelected ? null : file)
  }

  const handleOpenDetail = (file: FileItem) => {
    setSelectedFile(file)
    if (!isDetailBarOpen) toggleDetailBar()
    setSelectedFileId(file.id)
    onSelect?.(file)
  }

  return (
    <div
      ref={gridRef}
      className={cn(
        'grid gap-3',
        isDetailBarOpen
          ? 'grid-cols-2 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
      )}
    >
      {files.map((file) => (
        <SharedFileCard
          key={file.id}
          file={file}
          isSelected={selectedFileId === file.id}
          onClick={() => handleCardClick(file)}
          onDownload={onDownload}
          onView={onView}
          onOpenDetail={handleOpenDetail}
        />
      ))}
    </div>
  )
}
