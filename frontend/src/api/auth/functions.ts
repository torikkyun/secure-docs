import { createServerFn } from '@tanstack/react-start'
import { useAppSession } from '@/utils/session'
import { API_URL } from '../env'
import { z } from 'zod'
import { getHeaders, getForwardHeaders } from '@/utils/get-header'
import { LoginResult, RegisterResult, VerifyPasscodeResult } from './types'
import { loginSchema, registerSchema } from './schemas'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<LoginResult> => {
    const forwardHeaders = getForwardHeaders()
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...forwardHeaders,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    const result = await res.json()

    try {
      const session = await useAppSession()
      await session.update({
        accessToken: result.accessToken,
      })
    } catch (sessionError) {
      console.error('SESSION UPDATE ERROR:', sessionError)
      throw new Error(
        `Failed to create session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}`,
      )
    }

    return result
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }): Promise<RegisterResult> => {
    const forwardHeaders = getForwardHeaders()
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...forwardHeaders,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    const result = await res.json()

    try {
      const session = await useAppSession()
      await session.update({
        accessToken: result.accessToken,
      })
    } catch (sessionError) {
      console.error('SESSION UPDATE ERROR:', sessionError)
      throw new Error(
        `Failed to create session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}`,
      )
    }

    return result
  })

export const verifyPasscodeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ passcode: z.string() }))
  .handler(async ({ data }): Promise<VerifyPasscodeResult> => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/auth/verify-passcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message)
    }

    return res.json()
  })
