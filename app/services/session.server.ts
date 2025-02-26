import { createCookieSessionStorage, redirect } from '@remix-run/node'

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

export const requireSessionCookie = async (request: Request) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  if (!user) {
    console.log('redirecting...')
    throw redirect('/auth')
  }

  return user
}

export const { getSession, commitSession, destroySession } = sessionStorage
