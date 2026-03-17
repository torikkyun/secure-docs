import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  decryptPrivateKey,
  getUserKeys,
  unwrapAesKey,
  decryptFileData,
  deriveSharedSecret,
  deriveWrappingKeyFromSharedSecret,
  toBase64,
} from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasscodeInput } from '@/components/passcode-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, FileText, ShieldCheck } from 'lucide-react'
import { FileItem } from '@/api/file/types'
import {
  downloadFileStreamFn,
  getFileForDownloadFn,
} from '@/api/file/functions'

interface DownloadFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function DownloadFileModal({
  file,
  isOpen,
  onClose,
}: DownloadFileModalProps) {
  const [passcode, setPasscode] = useState('')

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !passcode) {
        throw new Error('Vui lòng nhập passcode')
      }

      const userKeys = getUserKeys()
      if (!userKeys) {
        throw new Error('Không tìm thấy khóa người dùng')
      }

      // 1. Decrypt My Private Key
      let myPrivateKey: string
      try {
        myPrivateKey = await decryptPrivateKey(
          userKeys.encryptedPrivateKey,
          passcode,
        )
      } catch (e) {
        throw new Error('Passcode không đúng')
      }

      // 2. Get file download info from backend (includes correct wrappedAesKey)
      const downloadInfo = await getFileForDownloadFn({
        data: { fileId: file.id },
      })

      // Backend returns wrappedAesKey already resolved for current user
      // - If owner: wrapped with owner's key (ECDH with own public key)
      // - If recipient: wrapped with recipient's key (ECDH with owner's public key)
      const wrappedAesKey = downloadInfo.wrappedAesKey
      const isOwner = downloadInfo.isOwner
      const ownerPublicKey = downloadInfo.owner.publicKey

      if (!wrappedAesKey) {
        throw new Error('Không tìm thấy khóa giải mã cho file này')
      }

      // 3. Derive Wrapping Key & Unwrap AES Key
      // If owner: ECDH(myPriv, myPub)
      // If recipient: ECDH(myPriv, ownerPub) - must use owner's public key
      const peerPublicKey = isOwner ? userKeys.publicKey : ownerPublicKey

      if (!peerPublicKey) {
        throw new Error('Không tìm thấy khóa công khai của chủ sở hữu')
      }

      const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey)
      const wrappingKey = await deriveWrappingKeyFromSharedSecret(sharedSecret)

      let aesKey: string
      try {
        aesKey = await unwrapAesKey(wrappedAesKey, wrappingKey)
      } catch (e) {
        throw new Error(
          'Không thể giải mã khóa file. Có thể bạn không có quyền hoặc khóa bị lỗi.',
        )
      }

      // 4. Download Encrypted Body (returns base64 string from server function)
      const { blob: encryptedBase64 } = await downloadFileStreamFn({
        data: { fileId: file.id },
      })

      // Convert base64 back to binary
      const binaryString = atob(encryptedBase64)
      const encryptedBytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i)
      }

      // 5. Decrypt File Data
      // File format: [12 bytes IV][Ciphertext] - AES-GCM uses 12-byte IV
      if (encryptedBytes.length < 12) {
        throw new Error('Định dạng file mã hóa không hợp lệ')
      }

      const iv = encryptedBytes.slice(0, 12)
      const ciphertext = encryptedBytes.slice(12)

      const decryptedBuffer = await decryptFileData(
        ciphertext,
        aesKey,
        toBase64(iv),
      )

      // 6. Save File
      // @ts-ignore - Type incompatibility with ArrayBufferLike
      const blob = new Blob([decryptedBuffer], { type: file.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success('Tải xuống thành công!', {
        description: `File ${file?.filename} đã được giải mã và tải về.`,
      })
      handleClose()
    },
    onError: (error: Error) => {
      console.error('Download error:', error)
      toast.error('Lỗi tải xuống', {
        description: error.message,
      })
    },
  })

  const handleClose = () => {
    onClose()
    setPasscode('')
    downloadMutation.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Tải xuống bảo mật
          </DialogTitle>
          <DialogDescription>
            Tài liệu được mã hóa đầu cuối. Vui lòng xác thực để giải mã và tải
            xuống.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-background p-2 rounded-md shadow-sm">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm break-all">{file?.filename}</p>
              {!file?.isOwner && file?.sharedBy && (
                <p className="text-xs text-muted-foreground truncate">
                  Chia sẻ bởi: {file.sharedBy.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t mt-2">
            <Label className="flex items-center gap-1.5">
              Passcode xác nhận
            </Label>
            <PasscodeInput value={passcode} onChange={setPasscode} />
            <p className="text-[10px] text-muted-foreground text-center">
              Nhập 6 số passcode để giải mã và tải xuống
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between sm:flex-row-reverse gap-2">
          <Button
            type="button"
            onClick={() => downloadMutation.mutate()}
            disabled={passcode.length < 6 || downloadMutation.isPending}
            className="w-full sm:w-auto min-w-30"
          >
            {downloadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang giải mã...
              </>
            ) : (
              'Giải mã & Tải xuống'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={downloadMutation.isPending}
            className="w-full sm:w-auto"
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
