import { createCookieSessionStorage, redirect } from 'react-router'
import { User } from '~/types/user'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable must be set')
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
  },
})

export const requireSessionCookie = async (request: Request): Promise<User> => {
  const cookie = request.headers.get('Cookie')
  const session = await sessionStorage.getSession(cookie)

  const user = session.get('user')

  if (!user) {
    throw redirect('/auth')
  }

  return { ...user }
}

export const { getSession, commitSession, destroySession } = sessionStorage
