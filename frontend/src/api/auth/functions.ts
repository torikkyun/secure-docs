import { API_URL } from '../env'
import { z } from 'zod'
import { getHeaders } from '@/utils/get-header'
import { LoginResult, RegisterResult, VerifyPasscodeResult } from './types'
import { loginSchema, registerSchema } from './schemas'

export const loginFn = async ({
  data,
}: {
  data: z.infer<typeof loginSchema>
}): Promise<LoginResult> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  const result = await res.json()
  localStorage.setItem('access_token', result.accessToken)
  return result
}

export const registerFn = async ({
  data,
}: {
  data: z.infer<typeof registerSchema>
}): Promise<RegisterResult> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  const result = await res.json()
  localStorage.setItem('access_token', result.accessToken)
  return result
}

export const verifyPasscodeFn = async ({
  data,
}: {
  data: { passcode: string }
}): Promise<VerifyPasscodeResult> => {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}/auth/verify-passcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message)
  }

  return res.json()
}
