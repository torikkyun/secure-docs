import { redirect } from '@tanstack/react-router'
import { useAppSession } from './session'

export const getHeaders = async () => {
  const session = await useAppSession()
  const accessToken = session.data.accessToken

  if (!accessToken) {
    await session.clear()
    throw redirect({ to: '/login' })
  }
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}
