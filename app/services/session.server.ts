import { createCookieSessionStorage, redirect } from 'react-router'
import { SessionUser, User } from '~/types/user'
import { get, isNetworkError } from '~/services/networkService'

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
 * Throws a redirect to /auth and destroys the session when an API call returns
 * 401, 403, or 404 (Remix session is present but the API cannot authenticate
 * the forwarded cookie or the user no longer exists in the database).
 * Call this in action/loader catch blocks before other error handling.
 */
export const redirectOnUnauthorized = async (
  error: unknown,
  request: Request,
): Promise<never | void> => {
  if (
    isNetworkError(error) &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  ) {
    const session = await getSession(request.headers.get('Cookie'))
    throw redirect('/auth', {
      headers: { 'Set-Cookie': await destroySession(session) },
    })
  }
}

/**
 * Require an authenticated session and fetch the current profile from the API.
 * Use this in loaders/actions that need fields beyond id/email/name (settings,
 * skill level, emergency contact, etc.). The session cookie is forwarded so
 * the API can authenticate the call.
 *
 * Automatically redirects to /auth if the API returns 401, 403, or 404 for
 * the profile request (stale or invalid session relative to the API database).
 */
export const requireFullUserProfile = async (
  request: Request,
): Promise<User> => {
  await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''
  try {
    const profileResponse = await get<User>('user/me', {
      headers: { Cookie: cookie },
    })
    return profileResponse?.data as User
  } catch (error) {
    await redirectOnUnauthorized(error, request)
    throw error
  }
}

export const { getSession, commitSession, destroySession } = sessionStorage
