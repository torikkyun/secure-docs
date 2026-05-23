import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { pdfjs, Document, Page } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type SlotState = { page: number; width: number }

export default function PdfViewer({
  data,
  currentPage,
  pageWidth,
  onLoadSuccess,
}: {
  data: ArrayBuffer
  currentPage: number
  pageWidth: number
  onLoadSuccess: (numPages: number) => void
}) {
  const [slots, setSlots] = useState<[SlotState, SlotState]>([
    { page: currentPage, width: pageWidth },
    { page: currentPage, width: pageWidth },
  ])
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)

  // Refs prevent stale closures inside async canvas render callbacks.
  const activeSlotRef = useRef<0 | 1>(0)
  const slotsRef = useRef(slots)
  const targetRef = useRef<SlotState>({ page: currentPage, width: pageWidth })

  useEffect(() => {
    activeSlotRef.current = activeSlot
  }, [activeSlot])

  useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  useEffect(() => {
    const target: SlotState = { page: currentPage, width: pageWidth }
    targetRef.current = target

    const active = activeSlotRef.current
    const shown = slotsRef.current[active]

    // Active slot already matches — nothing to pre-render.
    if (shown.page === currentPage && shown.width === pageWidth) return

    // Assign the new target to the back slot so it renders invisibly.
    const back = (1 - active) as 0 | 1
    setSlots((prev) => {
      const next = [...prev] as [SlotState, SlotState]
      next[back] = target
      return next
    })
  }, [currentPage, pageWidth])

  // Called when a slot's canvas finishes painting.
  // Swap only when the back slot matches the latest target — rapid changes
  // (e.g. many resize events during animation) will skip intermediate renders.
  const handleRenderSuccess = (slot: 0 | 1) => {
    if (slot === activeSlotRef.current) return
    const { page, width } = slotsRef.current[slot]
    const target = targetRef.current
    if (page === target.page && width === target.width) {
      setActiveSlot(slot)
    }
  }

  return (
    <Document
      file={data}
      onLoadSuccess={({ numPages }) => {
        onLoadSuccess(numPages)
        const init: SlotState = { page: 1, width: pageWidth }
        setSlots([init, init])
        setActiveSlot(0)
        activeSlotRef.current = 0
        slotsRef.current = [init, init]
        targetRef.current = init
      }}
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
      {/* Wrapper establishes the layout boundary. The active slot sits in
          normal flow; the back slot is absolute so it never shifts layout.
          overflow-hidden prevents the taller back-slot canvas from expanding
          the scroll height of ancestor scroll containers during transitions. */}
      <div className="relative overflow-hidden">
        {([0, 1] as const).map((slot) => {
          const isActive = slot === activeSlot
          return (
            <div
              key={slot}
              aria-hidden={!isActive}
              style={{
                position: isActive ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                visibility: isActive ? 'visible' : 'hidden',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <Page
                pageNumber={slots[slot].page}
                width={slots[slot].width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={() => handleRenderSuccess(slot)}
              />
            </div>
          )
        })}
      </div>
    </Document>
  )
}
