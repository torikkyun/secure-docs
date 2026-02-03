import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  accessToken: string
}

export function useAppSession() {
  const sessionSecret = process.env.SESSION_SECRET

  if (!sessionSecret) {
    throw new Error(
      'SESSION_SECRET environment variable is not set. Please check your .env file.',
    )
  }

  return useSession<SessionData>({
    name: 'app-session',
    password: sessionSecret,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60,
    },
  })
}
