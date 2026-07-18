import { LoaderFunction, Outlet, redirect } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import { loadInProgressSurfSessionForUser } from '~/services/surfSession.server'

export const loader: LoaderFunction = async ({ request }) => {
  const requestUrl = new URL(request.url)
  const isEndSessionIndex =
    requestUrl.pathname === '/end-session' || requestUrl.pathname === '/end-session/'

  if (!isEndSessionIndex) {
    return null
  }

  await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''
  const inProgressSession = await loadInProgressSurfSessionForUser(cookie)

  if (inProgressSession == null) {
    throw redirect('/sessions')
  }

  throw redirect(`/end-session/${inProgressSession.id}`)
}

export default function EndSessionLayout() {
  return <Outlet />
}
