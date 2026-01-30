import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  accessToken: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60,
    },
  })
}
