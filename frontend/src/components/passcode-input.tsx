import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PasscodeInputProps {
  value: string
  onChange: (v: string) => void
}

export function PasscodeInput({ value, onChange }: PasscodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (value === '') setDigits(Array(6).fill(''))
  }, [value])

  const update = (newDigits: string[]) => {
    setDigits(newDigits)
    onChange(newDigits.join(''))
  }

  const handleChange = (i: number, inputVal: string) => {
    const char = inputVal.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    update(next)
    if (char && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]
        next[i] = ''
        update(next)
      } else if (i > 0) {
        const next = [...digits]
        next[i - 1] = ''
        update(next)
        refs.current[i - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    const next = Array(6).fill('')
    for (let j = 0; j < pasted.length; j++) next[j] = pasted[j]
    update(next)
    setTimeout(() => refs.current[Math.min(pasted.length, 5)]?.focus(), 0)
  }

  const filledCount = digits.filter(Boolean).length

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete="off"
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onClick={() => refs.current[i]?.select()}
            aria-label={`Số ${i + 1} của passcode`}
            className={cn(
              'h-12 w-10 rounded-md border bg-transparent text-center text-lg font-bold shadow-xs',
              'transition-[color,box-shadow,opacity] outline-none',
              'focus:ring-[3px] focus:ring-ring/50 focus:border-ring',
              digit ? 'border-ring/60' : 'border-input',
              i > filledCount && 'opacity-30 cursor-not-allowed',
            )}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 w-6 rounded-full transition-colors',
              i < filledCount ? 'bg-ring' : 'bg-muted',
            )}
          />
        ))}
      </div>
    </div>
  )
}
