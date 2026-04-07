import { redirect } from '@tanstack/react-router'
import { getRequestIP, getRequestHeader } from '@tanstack/react-start/server'
import { useAppSession } from './session'

export const getForwardHeaders = () => {
  const forwardHeaders: Record<string, string> = {}

  const ip = getRequestIP({ xForwardedFor: true })
  if (ip) {
    forwardHeaders['x-forwarded-for'] = ip
  }

  const userAgent = getRequestHeader('user-agent')
  if (userAgent) {
    forwardHeaders['user-agent'] = userAgent
  }

  return forwardHeaders
}

export const getHeaders = async () => {
  const session = await useAppSession()
  const accessToken = session.data.accessToken

  if (!accessToken) {
    await session.clear()
    throw redirect({ to: '/login' })
  }

  const forwardHeaders = getForwardHeaders()
  forwardHeaders['Authorization'] = `Bearer ${accessToken}`

  return forwardHeaders
}
