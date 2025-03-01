import { LoaderFunction, redirect } from 'react-router'

import { getSession, destroySession } from '~/services/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  // Clear the session and redirect user
  return redirect('/surf-spots', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}
