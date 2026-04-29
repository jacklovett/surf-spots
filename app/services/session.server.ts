import { createCookieSessionStorage, redirect } from 'react-router'
import { SessionUser, User } from '~/types/user'
import { get } from '~/services/networkService'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable must be set')
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
  },
})

/**
 * Require an authenticated session and return the minimal identity stored in
 * the cookie (id / email / name only). Loaders that need richer profile data
 * should call requireFullUserProfile instead so PII stays out of the cookie.
 */
export const requireSessionCookie = async (
  request: Request,
): Promise<SessionUser> => {
  const cookie = request.headers.get('Cookie')
  const session = await sessionStorage.getSession(cookie)

  const user = session.get('user') as SessionUser | undefined

  if (!user) {
    throw redirect('/auth')
  }

  return { ...user }
}

/**
 * Require an authenticated session and fetch the current profile from the API.
 * Use this in loaders/actions that need fields beyond id/email/name (settings,
 * skill level, emergency contact, etc.). The session cookie is forwarded so
 * the API can authenticate the call.
 */
export const requireFullUserProfile = async (
  request: Request,
): Promise<User> => {
  await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''
  return get<User>('user/me', { headers: { Cookie: cookie } })
}

export const { getSession, commitSession, destroySession } = sessionStorage
