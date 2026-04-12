import { API_URL } from '@/api/env'

const SERVER_ORIGIN = new URL(API_URL).origin

export function getAvatarUrl(
  avatar: string | null | undefined,
): string | undefined {
  if (!avatar) return undefined
  if (avatar.startsWith('http://') || avatar.startsWith('https://'))
    return avatar
  const normalized = avatar.replace(/\\/g, '/')
  const urlPath = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `${SERVER_ORIGIN}${urlPath}`
}
