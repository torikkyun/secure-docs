const GEMINI_API_KEY_STORAGE = 'geminiApiKey'

export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GEMINI_API_KEY_STORAGE)
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GEMINI_API_KEY_STORAGE, key)
}

export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GEMINI_API_KEY_STORAGE)
}

export async function summarizeWithGemini(
  pageTexts: string[],
): Promise<string> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('Chưa cấu hình Gemini API key')

  const formattedText = pageTexts
    .map((text, i) => `--- Trang ${i + 1} ---\n${text.trim()}`)
    .join('\n\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Hãy tóm tắt nội dung tài liệu sau bằng tiếng Việt, súc tích và rõ ràng. Khi đề cập đến thông tin cụ thể, hãy thêm dẫn chứng số trang ngay sau nội dung theo các quy tắc sau:
                - Một trang: [N] — ví dụ: "AI là trí tuệ nhân tạo [3]."
                - Hai trang riêng lẻ cùng chứa thông tin đó: [N, M] — ví dụ: "Được ứng dụng rộng rãi [5, 8]."
                - Một dải trang liên tục trên 2 trang: [N-M] — ví dụ: "Quá trình triển khai [10-14]."
                Trả về kết quả dạng markdown.\n\n${formattedText}`,
              },
            ],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as any)?.error?.message ?? `Gemini API lỗi: ${response.status}`,
    )
  }

  const data = await response.json()
  return (
    (data as any).candidates?.[0]?.content?.parts?.[0]?.text ??
    'Không có nội dung tóm tắt.'
  )
}

export type ClassificationResult = {
  classification:
    | 'UNCLASSIFIED'
    | 'PUBLIC'
    | 'INTERNAL'
    | 'CONFIDENTIAL'
    | 'RESTRICTED'
  contentFlag: 'SAFE' | 'SENSITIVE' | 'FLAGGED'
  reason: string
}

export async function classifyDocumentWithGemini(
  pageTexts: string[],
): Promise<ClassificationResult> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('Chưa cấu hình Gemini API key')

  const formattedText = pageTexts
    .map((text, i) => `--- Trang ${i + 1} ---\n${text.trim()}`)
    .join('\n\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Hãy phân tích nội dung tài liệu sau và trả về kết quả phân loại bảo mật và kiểm soát nội dung theo định dạng JSON thuần túy (không có markdown code block).

Các mức phân loại bảo mật (classification):
- UNCLASSIFIED: Chưa phân loại hoặc không xác định được
- PUBLIC: Tài liệu công khai nội bộ, không nhạy cảm
- INTERNAL: Tài liệu nội bộ dành cho mọi nhân viên
- CONFIDENTIAL: Tài liệu bảo mật, chỉ người liên quan mới được xem
- RESTRICTED: Tài liệu tối mật, cực kỳ nhạy cảm

Các cờ kiểm soát nội dung (contentFlag):
- SAFE: Nội dung bình thường, an toàn
- SENSITIVE: Phát hiện dữ liệu nhạy cảm (số CCCD, thông tin tài chính, y tế, mật khẩu, khóa bí mật...)
- FLAGGED: AI phát hiện nội dung đáng ngờ, vi phạm chính sách hoặc cần Admin xem xét

Trả về JSON có đúng 3 trường sau, không thêm bất kỳ thứ gì khác:
{
  "classification": "<một trong 5 giá trị trên>",
  "contentFlag": "<một trong 3 giá trị trên>",
  "reason": "<giải thích ngắn gọn bằng tiếng Việt, tối đa 100 ký tự>"
}

Nội dung tài liệu:
${formattedText}`,
              },
            ],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as any)?.error?.message ?? `Gemini API lỗi: ${response.status}`,
    )
  }

  const data = await response.json()
  const rawText: string =
    (data as any).candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Strip markdown code block if present
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    const parsed = JSON.parse(jsonText) as ClassificationResult
    const validClassifications = [
      'UNCLASSIFIED',
      'PUBLIC',
      'INTERNAL',
      'CONFIDENTIAL',
      'RESTRICTED',
    ] as const
    const validFlags = ['SAFE', 'SENSITIVE', 'FLAGGED'] as const

    return {
      classification: validClassifications.includes(parsed.classification)
        ? parsed.classification
        : 'UNCLASSIFIED',
      contentFlag: validFlags.includes(parsed.contentFlag)
        ? parsed.contentFlag
        : 'SAFE',
      reason: parsed.reason ?? '',
    }
  } catch {
    throw new Error('Gemini trả về kết quả không hợp lệ, không thể phân loại')
  }
}
