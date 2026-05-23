import { redirect } from '@tanstack/react-router'

export const getForwardHeaders = (): Record<string, string> => ({})

export const getHeaders = async (): Promise<Record<string, string>> => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw redirect({ to: '/login' })
  }

  return { Authorization: `Bearer ${token}` }
}
