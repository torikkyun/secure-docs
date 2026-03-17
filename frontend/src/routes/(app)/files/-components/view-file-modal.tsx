import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { createPortal } from 'react-dom'
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
import { getGeminiApiKey, summarizeWithGemini } from '@/lib/gemini'
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
import {
  Loader2,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { FileItem } from '@/api/file/types'
import {
  downloadFileStreamFn,
  getFileForDownloadFn,
} from '@/api/file/functions'
// Lazy-load PdfViewer so pdfjs-dist never executes in Node.js/SSR context.
// pdfjs-dist v5 uses browser-only APIs (DOMMatrix, OffscreenCanvas) at module
// init time, which would crash during server-side rendering.
const PdfViewer = lazy(() => import('./pdf-viewer'))

interface ViewFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function ViewFileModal({ file, isOpen, onClose }: ViewFileModalProps) {
  const [passcode, setPasscode] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageWidth, setPageWidth] = useState(800)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setPdfUrl(null)
      setPdfBuffer(null)
      setPasscode('')
      setNumPages(0)
      setCurrentPage(1)
      setSummary(null)
      setIsSummarizing(false)
      setShowSummary(false)
      viewMutation.reset()
    }
  }, [isOpen])

  // Revoke blob URL when it changes or component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  useEffect(() => {
    if (!pdfUrl || !containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth - 32)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [pdfUrl])

  const viewMutation = useMutation({
    mutationFn: async () => {
      if (!file || !passcode) throw new Error('Vui lòng nhập passcode')

      const userKeys = getUserKeys()
      if (!userKeys) throw new Error('Không tìm thấy khóa người dùng')

      // 1. Decrypt private key
      let myPrivateKey: string
      try {
        myPrivateKey = await decryptPrivateKey(
          userKeys.encryptedPrivateKey,
          passcode,
        )
      } catch {
        throw new Error('Passcode không đúng')
      }

      // 2. Get file info (wrappedAesKey resolved for current user)
      const downloadInfo = await getFileForDownloadFn({
        data: { fileId: file.id },
      })

      const { wrappedAesKey, isOwner, owner } = downloadInfo
      if (!wrappedAesKey)
        throw new Error('Không tìm thấy khóa giải mã cho file này')

      // 3. Derive wrapping key & unwrap AES key
      const peerPublicKey = isOwner ? userKeys.publicKey : owner.publicKey
      if (!peerPublicKey)
        throw new Error('Không tìm thấy khóa công khai của chủ sở hữu')

      const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey)
      const wrappingKey = await deriveWrappingKeyFromSharedSecret(sharedSecret)

      let aesKey: string
      try {
        aesKey = await unwrapAesKey(wrappedAesKey, wrappingKey)
      } catch {
        throw new Error(
          'Không thể giải mã khóa file. Có thể bạn không có quyền hoặc khóa bị lỗi.',
        )
      }

      // 4. Download encrypted blob
      const { blob: encryptedBase64 } = await downloadFileStreamFn({
        data: { fileId: file.id },
      })

      const binaryString = atob(encryptedBase64)
      const encryptedBytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i)
      }

      // 5. Decrypt — format: [12 bytes IV][Ciphertext]
      if (encryptedBytes.length < 12)
        throw new Error('Định dạng file mã hóa không hợp lệ')

      const iv = encryptedBytes.slice(0, 12)
      const ciphertext = encryptedBytes.slice(12)
      const decryptedBuffer = await decryptFileData(
        ciphertext,
        aesKey,
        toBase64(iv),
      )

      // 6. Return the raw ArrayBuffer — react-pdf accepts { data: ArrayBuffer }
      // This avoids blob URL fetching from the Worker thread which can silently fail.
      return decryptedBuffer.buffer as ArrayBuffer
    },
    onSuccess: (buffer) => {
      const blob = new Blob([buffer], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfBuffer(buffer)
    },
    onError: (error: Error) => {
      toast.error('Không thể mở tệp', { description: error.message })
    },
  })

  const handleClose = () => {
    setPdfUrl(null)
    setPdfBuffer(null)
    setPasscode('')
    setSummary(null)
    setIsSummarizing(false)
    setShowSummary(false)
    viewMutation.reset()
    onClose()
  }

  const handleSummarize = async () => {
    if (!pdfBuffer) return

    if (!getGeminiApiKey()) {
      toast.error('Chưa cấu hình Gemini API key', {
        description: 'Vào Cài đặt → Gemini AI để thêm API key.',
      })
      return
    }

    setShowSummary(true)
    setIsSummarizing(true)
    setSummary(null)

    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()

      const pdf = await getDocument({ data: pdfBuffer.slice(0) }).promise
      const pageTexts: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
        pageTexts.push(text)
      }

      const fullText = pageTexts.join('\n\n').trim()
      if (!fullText) {
        toast.error('Không thể trích xuất văn bản từ PDF này')
        setShowSummary(false)
        return
      }

      const result = await summarizeWithGemini(fullText)
      setSummary(result)
    } catch (err: any) {
      toast.error('Tóm tắt thất bại', { description: err.message })
      setShowSummary(false)
    } finally {
      setIsSummarizing(false)
    }
  }

  const isPdf = file?.mimeType === 'application/pdf'

  // Full-screen PDF viewer rendered via portal using canvas (no browser download toolbar)
  const pdfViewer = pdfUrl
    ? createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-muted/95">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">
                {file?.filename}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {numPages > 0 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {currentPage} / {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={currentPage >= numPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(numPages, p + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1.5" />
                )}
                Tóm tắt AI
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="h-4 w-4 mr-1.5" />
                Đóng
              </Button>
            </div>
          </div>

          {/* PDF canvas + summary panel */}
          <div className="flex-1 flex overflow-hidden">
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto flex justify-center py-6 px-4"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Suspense
                fallback={
                  <div className="flex items-center gap-2 text-muted-foreground mt-20">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải trang...
                  </div>
                }
              >
                <PdfViewer
                  url={pdfUrl!}
                  currentPage={currentPage}
                  pageWidth={pageWidth}
                  onLoadSuccess={(n) => {
                    setNumPages(n)
                    setCurrentPage(1)
                  }}
                />
              </Suspense>
            </div>

            {/* Summary panel */}
            {showSummary && (
              <div className="w-80 shrink-0 border-l bg-background flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Tóm tắt AI
                  </div>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
                  {isSummarizing ? (
                    <div className="flex items-center gap-2 text-muted-foreground mt-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tóm tắt...
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{summary}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      {pdfViewer}
      <Dialog
        open={isOpen && !pdfUrl}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Xem trực tuyến
              </DialogTitle>
              <DialogDescription>
                {isPdf
                  ? 'Tài liệu được mã hóa đầu cuối. Nhập passcode để giải mã và xem ngay trên trình duyệt.'
                  : 'Chỉ hỗ trợ xem trực tuyến file PDF.'}
              </DialogDescription>
            </DialogHeader>

            {isPdf && (
              <div className="flex flex-col gap-4 py-4">
                <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                  <div className="bg-background p-2 rounded-md shadow-sm">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm break-all">
                      {file?.filename}
                    </p>
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
                    Nhập 6 số passcode để giải mã và xem tài liệu
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="sm:justify-between sm:flex-row-reverse gap-2">
              {isPdf && (
                <Button
                  type="button"
                  onClick={() => viewMutation.mutate()}
                  disabled={passcode.length < 6 || viewMutation.isPending}
                  className="w-full sm:w-auto min-w-30"
                >
                  {viewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang giải mã...
                    </>
                  ) : (
                    'Giải mã & Xem'
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        </DialogContent>
      </Dialog>
    </>
  )
}
