import { Loader2 } from 'lucide-react'
import { pdfjs, Document, Page } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PdfViewer({
  url,
  currentPage,
  pageWidth,
  onLoadSuccess,
}: {
  url: string
  currentPage: number
  pageWidth: number
  onLoadSuccess: (numPages: number) => void
}) {
  return (
    <Document
      file={url}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      loading={
        <div className="flex items-center gap-2 text-muted-foreground mt-20">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải trang...
        </div>
      }
      error={
        <div className="flex items-center gap-2 text-destructive mt-20">
          Không thể tải file PDF. Dữ liệu có thể bị lỗi.
        </div>
      }
    >
      <Page
        pageNumber={currentPage}
        width={pageWidth}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  )
}
