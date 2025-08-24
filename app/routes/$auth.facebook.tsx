import { LoaderFunction } from 'react-router'
import { authenticateWithFacebook } from '~/services/facebook.auth.server'

export const loader: LoaderFunction = async ({ request }) =>
  await authenticateWithFacebook(request)
