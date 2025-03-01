import { LoaderFunction } from 'react-router'
import { authenticateWithGoogle } from '~/services/google.auth.server'

export const loader: LoaderFunction = async ({ request }) =>
  await authenticateWithGoogle(request)
