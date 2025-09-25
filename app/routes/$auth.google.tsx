import { LoaderFunction } from 'react-router'
import { authenticateWithGoogle } from '~/services/google.auth.server'
import { handleOAuthError } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    return await authenticateWithGoogle(request)
  } catch (error) {
    return handleOAuthError(error, 'google')
  }
}
