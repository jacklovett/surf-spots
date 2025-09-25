import { LoaderFunction } from 'react-router'
import { authenticateWithFacebook } from '~/services/facebook.auth.server'
import { handleOAuthError } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    return await authenticateWithFacebook(request)
  } catch (error) {
    return handleOAuthError(error, 'facebook')
  }
}
