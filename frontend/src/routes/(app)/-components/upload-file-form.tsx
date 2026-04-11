import { useState, useEffect, useRef } from 'react'
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
import { Upload, X, Loader2, Sparkles } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { uploadFilesFn } from '@/api/file/functions'
import {
  getGeminiApiKey,
  classifyDocumentWithGemini,
  ClassificationResult,
} from '@/lib/gemini'
import type { FileClassification, ContentFlag } from '@/api/file/types'

interface FileClassificationState {
  classification: FileClassification
  contentFlag: ContentFlag
  reason: string
  isPending: boolean
  error?: string
}

interface UploadFileFormProps {
  onClose: () => void
}

const CLASSIFICATION_CONFIG: Record<
  FileClassification,
  { label: string; className: string }
> = {
  UNCLASSIFIED: {
    label: 'Chưa phân loại',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  PUBLIC: {
    label: 'Công khai',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  INTERNAL: {
    label: 'Nội bộ',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  CONFIDENTIAL: {
    label: 'Bảo mật',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  RESTRICTED: {
    label: 'Tối mật',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

const FLAG_CONFIG: Record<ContentFlag, { label: string; className: string }> = {
  SAFE: {
    label: 'An toàn',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  SENSITIVE: {
    label: 'Nhạy cảm',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  FLAGGED: {
    label: 'Cần xem xét',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function UploadFileForm({ onClose }: UploadFileFormProps) {
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [enableBlockchainLogging, setEnableBlockchainLogging] = useState(true)
  const [showPasscode, setShowPasscode] = useState(false)
  const [classificationMap, setClassificationMap] = useState<
    Map<number, FileClassificationState>
  >(new Map())
  const classifiedKeysRef = useRef<Set<string>>(new Set())

  // Auto-classify PDF files when selectedFiles changes
  useEffect(() => {
    const apiKey = getGeminiApiKey()
    if (!apiKey) return

    selectedFiles.forEach((file, index) => {
      if (file.type !== 'application/pdf') return

      // Stable key per file to avoid re-classifying same file at same index
      const fileKey = `${index}:${file.name}:${file.size}`
      if (classifiedKeysRef.current.has(fileKey)) return
      classifiedKeysRef.current.add(fileKey)

      setClassificationMap((prev) => {
        const next = new Map(prev)
        next.set(index, {
          classification: 'UNCLASSIFIED',
          contentFlag: 'SAFE',
          reason: '',
          isPending: true,
        })
        return next
      })

      ;(async () => {
        try {
          const { getDocument, GlobalWorkerOptions } =
            await import('pdfjs-dist')
          GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString()

          const arrayBuffer = await file.arrayBuffer()
          const pdf = await getDocument({ data: arrayBuffer }).promise
          const pageTexts: string[] = []
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const text = content.items
              .map((item: any) => ('str' in item ? item.str : ''))
              .join(' ')
            pageTexts.push(text)
          }

          const hasText = pageTexts.some((t) => t.trim())
          if (!hasText) {
            setClassificationMap((prev) => {
              const next = new Map(prev)
              next.set(index, {
                classification: 'UNCLASSIFIED',
                contentFlag: 'SAFE',
                reason: 'Không thể trích xuất văn bản từ PDF',
                isPending: false,
              })
              return next
            })
            return
          }

          const result: ClassificationResult =
            await classifyDocumentWithGemini(pageTexts)

          setClassificationMap((prev) => {
            const next = new Map(prev)
            next.set(index, {
              classification: result.classification,
              contentFlag: result.contentFlag,
              reason: result.reason,
              isPending: false,
            })
            return next
          })
        } catch (err: any) {
          classifiedKeysRef.current.delete(fileKey)
          setClassificationMap((prev) => {
            const next = new Map(prev)
            next.set(index, {
              classification: 'UNCLASSIFIED',
              contentFlag: 'SAFE',
              reason: '',
              isPending: false,
              error: err.message,
            })
            return next
          })
        }
      })()
    })
  }, [selectedFiles])

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

      // 2. Derive wrapping key once (self-wrapping)
      const sharedSecret = await deriveSharedSecret(
        privateKey,
        userKeys.publicKey,
      )
      const wrappingKey = await deriveWrappingKeyFromSharedSecret(sharedSecret)

      // 3. Prepare FormData
      const formData = new FormData()
      const wrappedAesKeys: string[] = []
      const classifications: FileClassification[] = []
      const contentFlags: ContentFlag[] = []

      // 4. Process each file
      for (const [index, file] of selectedFiles.entries()) {
        const aesKey = generateAesKey()

        const fileBuffer = await file.arrayBuffer()
        const { encryptedData, iv } = await encryptFileData(
          new Uint8Array(fileBuffer),
          aesKey,
        )

        const ivBytes = fromBase64(iv)
        const finalBuffer = new Uint8Array(
          ivBytes.length + encryptedData.length,
        )
        finalBuffer.set(ivBytes)
        finalBuffer.set(encryptedData, ivBytes.length)

        const wrappedAesKey = await wrapAesKey(aesKey, wrappingKey)
        wrappedAesKeys.push(wrappedAesKey)

        const classResult = classificationMap.get(index)
        classifications.push(classResult?.classification ?? 'UNCLASSIFIED')
        contentFlags.push(classResult?.contentFlag ?? 'SAFE')

        const encryptedBlob = new Blob([finalBuffer], { type: file.type })
        formData.append('file', encryptedBlob, file.name)
      }

      // 5. Append metadata arrays
      formData.append('wrappedAesKeys', JSON.stringify(wrappedAesKeys))
      formData.append('classifications', JSON.stringify(classifications))
      formData.append('contentFlags', JSON.stringify(contentFlags))
      formData.append(
        'enableBlockchainLogging',
        enableBlockchainLogging.toString(),
      )

      return uploadFilesFn({ data: formData })
    },
    onSuccess: () => {
      toast('Tải lên thành công!', {
        description: `Đã tải lên và mã hóa bảo mật ${selectedFiles.length} tệp tin.`,
      })
      setSelectedFiles([])
      setEnableBlockchainLogging(true)
      setShowPasscode(false)
      setClassificationMap(new Map())
      classifiedKeysRef.current.clear()
      queryClient.invalidateQueries({ queryKey: ['files'] })
      onClose()
    },
    onError: (err) => {
      toast('Tải lên thất bại', { description: err.message })
    },
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      setClassificationMap((prevMap) => {
        const nextMap = new Map<number, FileClassificationState>()
        prev.forEach((_, i) => {
          if (i === index) return
          const newIndex = i < index ? i : i - 1
          const entry = prevMap.get(i)
          if (entry) nextMap.set(newIndex, entry)
        })
        return nextMap
      })
      classifiedKeysRef.current.clear()
      return next
    })
  }

  const hasAnyPending = Array.from(classificationMap.values()).some(
    (v) => v.isPending,
  )
  const hasGeminiKey = !!getGeminiApiKey()

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
                  <div className="text-foreground">
                    Nhấn để chọn hoặc kéo thả tệp vào đây
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Hỗ trợ mọi định dạng, mã hóa tự động
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
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
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {selectedFiles.map((file, index) => {
                      const classState = classificationMap.get(index)
                      const isPdf = file.type === 'application/pdf'
                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-1.5 bg-muted/40 p-2 rounded-md border border-border group hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-background p-1.5 rounded-md shadow-sm shrink-0">
                              {(() => {
                                const { Icon, colorClass } = getFileIcon(
                                  file.type,
                                )
                                return (
                                  <Icon className={`h-4 w-4 ${colorClass}`} />
                                )
                              })()}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm break-all">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-70 group-hover:opacity-100 hover:text-destructive transition-all shrink-0"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* AI classification result (PDF only) */}
                          {isPdf && hasGeminiKey && (
                            <div className="flex items-center gap-1.5 pl-1">
                              {classState?.isPending ? (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  AI đang phân loại...
                                </span>
                              ) : classState && !classState.error ? (
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  <Sparkles className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] h-5 px-1.5 ${CLASSIFICATION_CONFIG[classState.classification].className}`}
                                    title={classState.reason}
                                  >
                                    {
                                      CLASSIFICATION_CONFIG[
                                        classState.classification
                                      ].label
                                    }
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] h-5 px-1.5 ${FLAG_CONFIG[classState.contentFlag].className}`}
                                  >
                                    {FLAG_CONFIG[classState.contentFlag].label}
                                  </Badge>
                                  {classState.reason && (
                                    <span
                                      className="text-[10px] text-muted-foreground truncate max-w-40"
                                      title={classState.reason}
                                    >
                                      {classState.reason}
                                    </span>
                                  )}
                                </span>
                              ) : classState?.error ? (
                                <span className="text-[11px] text-muted-foreground">
                                  Không thể phân loại AI
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )
                    })}
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
              Hủy
            </Button>
            <Button
              onClick={() => setShowPasscode(true)}
              disabled={selectedFiles.length === 0 || hasAnyPending}
              className="min-w-35"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : hasAnyPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang phân loại...
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
