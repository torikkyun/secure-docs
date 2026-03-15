import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import {
  getGeminiApiKey,
  setGeminiApiKey,
  removeGeminiApiKey,
} from '@/lib/gemini'

export function GeminiApiKeyForm() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const stored = getGeminiApiKey()
    if (stored) {
      setApiKey(stored)
      setIsSaved(true)
    }
  }, [])

  const handleSave = () => {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      toast.error('Vui lòng nhập API key')
      return
    }
    setGeminiApiKey(trimmed)
    setIsSaved(true)
    toast.success('Đã lưu Gemini API key')
  }

  const handleRemove = () => {
    removeGeminiApiKey()
    setApiKey('')
    setIsSaved(false)
    toast.success('Đã xóa Gemini API key')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gemini-api-key">API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="gemini-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="AIza..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button onClick={handleSave}>Lưu</Button>
          {isSaved && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          API key được lưu cục bộ trên trình duyệt, không gửi lên server.
        </p>
      </div>
      {isSaved && (
        <p className="text-xs text-green-600">✓ Đã cấu hình Gemini API key</p>
      )}
    </div>
  )
}
