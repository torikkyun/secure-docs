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
import { PasscodeConfirmModal } from '@/components/passcode-confirm-modal'
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
import { viewFileStreamFn, getFileForDownloadFn } from '@/api/file/functions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// Lazy-load PdfViewer so pdfjs-dist never executes in Node.js/SSR context.
// pdfjs-dist v5 uses browser-only APIs (DOMMatrix, OffscreenCanvas) at module
// init time, which would crash during server-side rendering.
const PdfViewer = lazy(() => import('./pdf-viewer'))

// Pre-process [N], [N-M] and [N, M, ...] citation markers (from Gemini) into
// markdown links so they can be intercepted by the custom `a` component.
// Single-pass to avoid re-matching already-converted text.
function preprocessCitations(markdown: string): string {
  return markdown.replace(
    /\[(\d+(?:\s*[,\-\u2013\u2014]\s*\d+)*)\]/g,
    (_, inner: string) => {
      // Range: [19-20] or [19 – 20]
      const rangeMatch = inner.match(/^(\d+)\s*[-\u2013\u2014]\s*(\d+)$/)
      if (rangeMatch) {
        const [, from, to] = rangeMatch
        return `[${from}\u2013${to}](#page-range-${from}-${to})`
      }
      // Comma list: [1, 2] or [1, 2, 3]
      if (inner.includes(',')) {
        return inner
          .split(',')
          .map((n) => n.trim())
          .map((n) => `[${n}](#page-${n})`)
          .join('')
      }
      // Single: [19]
      return `[${inner}](#page-${inner})`
    },
  )
}

interface ViewFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export function ViewFileModal({ file, isOpen, onClose }: ViewFileModalProps) {
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
      setPdfBuffer(null)
      setNumPages(0)
      setCurrentPage(1)
      setSummary(null)
      setIsSummarizing(false)
      setShowSummary(false)
      viewMutation.reset()
    }
  }, [isOpen])

  useEffect(() => {
    if (!pdfBuffer || !containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth - 32)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [pdfBuffer])

  const viewMutation = useMutation({
    mutationFn: async (passcode: string) => {
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

      // 4. Fetch encrypted blob via view endpoint (logs VIEW activity)
      const { blob: encryptedBase64 } = await viewFileStreamFn({
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
      setPdfBuffer(buffer)
    },
    onError: (error: Error) => {
      toast.error('Không thể mở tệp', { description: error.message })
    },
  })

  const handleClose = () => {
    setPdfBuffer(null)
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

      const hasText = pageTexts.some((t) => t.trim())
      if (!hasText) {
        toast.error('Không thể trích xuất văn bản từ PDF này')
        setShowSummary(false)
        return
      }

      const result = await summarizeWithGemini(pageTexts)
      setSummary(result)
    } catch (err: any) {
      toast.error('Tóm tắt thất bại', { description: err.message })
      setShowSummary(false)
    } finally {
      setIsSummarizing(false)
    }
  }

  const onCitationClick = (page: number) => {
    if (page >= 1 && page <= numPages) setCurrentPage(page)
  }

  const isPdf = file?.mimeType === 'application/pdf'

  // Full-screen PDF viewer rendered via portal using canvas (no browser download toolbar)
  const pdfViewer = pdfBuffer
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
              className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex justify-center py-6 px-4"
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
                  data={pdfBuffer!}
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
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-base font-bold mt-4 mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-bold mt-3 mb-1.5">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold mt-2 mb-1">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-2 space-y-0.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-2 space-y-0.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-border pl-3 text-muted-foreground italic mb-2">
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr className="border-border my-3" />,
                          a: ({ href, children }) => {
                            // Range citation: #page-range-N-M
                            const rangeMatch = href?.match(
                              /^#page-range-(\d+)-(\d+)$/,
                            )
                            if (rangeMatch) {
                              const from = parseInt(rangeMatch[1], 10)
                              const to = parseInt(rangeMatch[2], 10)
                              return (
                                <button
                                  onClick={() => onCitationClick(from)}
                                  className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-sm cursor-pointer transition-colors mx-0.5 align-text-top shadow-sm"
                                  title={`Đến trang ${from}–${to}`}
                                >
                                  {children}
                                </button>
                              )
                            }
                            // Single citation: #page-N
                            const match = href?.match(/^#page-(\d+)$/)
                            if (match) {
                              const page = parseInt(match[1], 10)
                              return (
                                <button
                                  onClick={() => onCitationClick(page)}
                                  className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-sm cursor-pointer transition-colors mx-0.5 align-text-top shadow-sm"
                                  title={`Đến trang ${page}`}
                                >
                                  {children}
                                </button>
                              )
                            }
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            )
                          },
                        }}
                      >
                        {preprocessCitations(summary ?? '')}
                      </ReactMarkdown>
                    </div>
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
      <PasscodeConfirmModal
        isOpen={isOpen && !pdfBuffer && !!isPdf}
        onConfirm={(passcode) => viewMutation.mutate(passcode)}
        onCancel={handleClose}
        isPending={viewMutation.isPending}
        title="Xem tài liệu"
        description="Tài liệu được mã hóa đầu cuối. Nhập passcode để giải mã và xem ngay trên trình duyệt."
        confirmLabel="Giải mã & Xem"
      />
      {isOpen && !pdfBuffer && !isPdf && (
        <Dialog open onOpenChange={(open) => !open && handleClose()}>
          <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Xem trực tuyến
              </DialogTitle>
              <DialogDescription>
                Chỉ hỗ trợ xem trực tuyến file PDF.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
