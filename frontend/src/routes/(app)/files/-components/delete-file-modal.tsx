import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileItem } from '@/api/file/types'
import { deleteFileFn } from '@/api/file/functions'

interface DeleteFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteFileModal({
  file,
  isOpen,
  onClose,
}: DeleteFileModalProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Không tìm thấy file')
      return deleteFileFn({ data: { fileId: file.id } })
    },
    onSuccess: () => {
      toast.success(`Đã xóa "${file?.filename}" thành công`)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      onClose()
    },
    onError: (err) => {
      toast.error(`Lỗi: ${err.message}`)
    },
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa tài liệu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa{' '}
            <span className="font-medium text-foreground break-all">
              {file?.filename}
            </span>
            ? File sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
