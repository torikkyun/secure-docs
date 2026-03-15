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

export async function summarizeWithGemini(text: string): Promise<string> {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('Chưa cấu hình Gemini API key')

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
                text: `Hãy tóm tắt nội dung tài liệu sau bằng tiếng Việt, súc tích và rõ ràng:\n\n${text}`,
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
