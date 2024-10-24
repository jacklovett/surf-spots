import { LoaderFunction, redirect, json } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'
import { commitSession, getSession } from '~/services/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await authenticator.authenticate('google', request)
    const session = await getSession(request.headers.get('Cookie'))
    // Store user information in the session
    session.set('user', user)
    return redirect('/surf-spots', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  } catch (error) {
    console.error('Error handling Google callback:', error)
    return json({ error: 'Failed to handle Google callback.' }, { status: 500 })
  }
}
