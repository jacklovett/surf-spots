import { createCookieSessionStorage } from '@remix-run/node'

// Ensure SESSION_SECRET is defined
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

export const { getSession, commitSession, destroySession } = sessionStorage
