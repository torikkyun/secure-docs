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
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'
import { toast } from 'sonner'
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
  const downloadMutation = useMutation({
    mutationFn: async (passcode: string) => {
      if (!file) {
        throw new Error('Không tìm thấy file')
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
    downloadMutation.reset()
  }

  return (
    <PasscodeConfirmModal
      isOpen={isOpen}
      onConfirm={(passcode) => downloadMutation.mutate(passcode)}
      onCancel={handleClose}
      isPending={downloadMutation.isPending}
      title="Xác nhận tải xuống"
      description="Nhập passcode để giải mã và tải xuống tệp của bạn."
      confirmLabel="Giải mã & Tải xuống"
    />
  )
}
