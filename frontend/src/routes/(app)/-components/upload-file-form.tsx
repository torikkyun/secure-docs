import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  generateAesKey,
  encryptFileData,
  deriveWrappingKeyFromSharedSecret,
  deriveSharedSecret,
  wrapAesKey,
  decryptPrivateKey,
  getUserKeys,
  fromBase64,
} from '@/lib/crypto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'
import { Upload, X, Loader2 } from 'lucide-react'
import { getFileIcon, formatFileSize } from '@/lib/file-utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { uploadFilesFn } from '@/api/file/functions'

interface UploadFileFormProps {
  onClose: () => void
}

export function UploadFileForm({ onClose }: UploadFileFormProps) {
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [enableBlockchainLogging, setEnableBlockchainLogging] = useState(true)
  const [showPasscode, setShowPasscode] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async (passcode: string) => {
      if (selectedFiles.length === 0) throw new Error('Vui lòng chọn tệp')

      const userKeys = getUserKeys()
      if (!userKeys)
        throw new Error(
          'Không tìm thấy khóa người dùng. Vui lòng đăng nhập lại.',
        )

      // 1. Decrypt Private Key
      let privateKey: string
      try {
        privateKey = await decryptPrivateKey(
          userKeys.encryptedPrivateKey,
          passcode,
        )
      } catch {
        throw new Error('Passcode không đúng')
      }

      // 2. Derive wrapping key once (same for all files since it's self-wrapping)
      const sharedSecret = await deriveSharedSecret(
        privateKey,
        userKeys.publicKey,
      )
      const wrappingKey = await deriveWrappingKeyFromSharedSecret(sharedSecret)

      // 3. Prepare FormData
      const formData = new FormData()
      const wrappedAesKeys: string[] = []

      // 4. Process each file
      for (const file of selectedFiles) {
        // Generate unique AES Key for each file
        const aesKey = generateAesKey()

        // Encrypt File Data
        const fileBuffer = await file.arrayBuffer()
        const { encryptedData, iv } = await encryptFileData(
          new Uint8Array(fileBuffer),
          aesKey,
        )

        // Prepend IV to Encrypted Data
        const ivBytes = fromBase64(iv)
        const finalBuffer = new Uint8Array(
          ivBytes.length + encryptedData.length,
        )
        finalBuffer.set(ivBytes)
        finalBuffer.set(encryptedData, ivBytes.length)

        // Wrap AES Key
        const wrappedAesKey = await wrapAesKey(aesKey, wrappingKey)
        wrappedAesKeys.push(wrappedAesKey)

        // Add encrypted file to FormData
        const encryptedBlob = new Blob([finalBuffer], {
          type: file.type,
        })
        formData.append('file', encryptedBlob, file.name)
      }

      // 5. Add wrappedAesKeys array to FormData
      formData.append('wrappedAesKeys', JSON.stringify(wrappedAesKeys))

      formData.append(
        'enableBlockchainLogging',
        enableBlockchainLogging.toString(),
      )

      // Call API
      return uploadFilesFn({ data: formData })
    },
    onSuccess: () => {
      toast('Tải lên thành công!', {
        description: `Đã tải lên và mã hóa bảo mật ${selectedFiles.length} tệp tin.`,
      })
      setSelectedFiles([])
      setEnableBlockchainLogging(true)
      setShowPasscode(false)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      onClose()
    },
    onError: (err) => {
      toast('Tải lên thất bại', { description: err.message })
    },
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <PasscodeConfirmModal
        isOpen={showPasscode}
        onConfirm={(passcode) => uploadMutation.mutate(passcode)}
        onCancel={() => setShowPasscode(false)}
        isPending={uploadMutation.isPending}
        title="Xác nhận tải lên"
        description="Nhập passcode để mã hóa và tải lên tệp của bạn."
        confirmLabel="Mã hóa & Tải lên"
      />
      <Dialog open={!showPasscode} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {/* <Upload className="h-5 w-5 text-primary" /> */}
              Tải lên tệp bảo mật
            </DialogTitle>
            <DialogDescription>
              Tải lên và mã hóa tệp tin của bạn với chuẩn mã hóa AES-GCM đầu
              cuối.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-2">
            {/* File Selection */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Chọn tệp tin</Label>
              {selectedFiles.length === 0 ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group"
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-background transition-colors shadow-sm">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className=" text-foreground">
                    Nhấn để chọn hoặc kéo thả tệp vào đây
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Hỗ trợ mọi định dạng, mã hóa tự động
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className=" text-muted-foreground">
                      Đã chọn {selectedFiles.length} tệp
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        document.getElementById('file-upload')?.click()
                      }
                      className="h-8 text-xs"
                    >
                      + Thêm tệp
                    </Button>
                  </div>
                  <div className="max-h-45 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-muted/40 p-2 rounded-md border border-border group hover:border-primary/30 transition-colors"
                      >
                        <div className="bg-background p-1.5 rounded-md shadow-sm">
                          {(() => {
                            const { Icon, colorClass } = getFileIcon(file.type)
                            return <Icon className={`h-4 w-4 ${colorClass}`} />
                          })()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm  break-all">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-70 group-hover:opacity-100 hover:text-destructive transition-all"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  setSelectedFiles((prev) => [
                    ...prev,
                    ...Array.from(e.target.files || []),
                  ])
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Blockchain Option */}
              <div className="space-y-2">
                <Label>Tùy chọn nâng cao</Label>
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                  <Switch
                    id="blockchain-logging"
                    checked={enableBlockchainLogging}
                    onCheckedChange={setEnableBlockchainLogging}
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label
                      htmlFor="blockchain-logging"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Ghi nhật ký Blockchain
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Tăng tính minh bạch trên mạng Sepolia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploadMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => setShowPasscode(true)}
              disabled={selectedFiles.length === 0}
              className="min-w-35"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>Mã hóa & Tải lên</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
