import { redirect } from 'react-router'
import { AuthRequest } from '~/types/user'
import { registerUser } from './auth.server'

const facebookConfig = {
  clientId: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  callbackUrl: process.env.FACEBOOK_CALLBACK_URL!,
}

export const authenticateWithFacebook = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    const url = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    url.searchParams.set('client_id', facebookConfig.clientId)
    url.searchParams.set('redirect_uri', facebookConfig.callbackUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'public_profile,email')

    return redirect(url.toString())
  }

  try {
    // Handle OAuth callback
    const tokens = await getFacebookTokens(code)
    const profile = await getFacebookProfile(tokens.access_token)
    const { name, email, id } = profile

    const authRequest: AuthRequest = {
      email,
      name,
      provider: 'FACEBOOK',
      providerId: id,
    }

    return await registerUser(authRequest, request)
  } catch (error) {
    console.log(`Failed to authenticate with Facebook: ${error}`)
    throw error
  }
}

// Helper functions for token exchange and profile fetching
const getFacebookTokens = async (code: string) => {
  const tokenUrl = new URL(
    'https://graph.facebook.com/v18.0/oauth/access_token',
  )
  tokenUrl.searchParams.set('client_id', facebookConfig.clientId)
  tokenUrl.searchParams.set('client_secret', facebookConfig.clientSecret)
  tokenUrl.searchParams.set('redirect_uri', facebookConfig.callbackUrl)
  tokenUrl.searchParams.set('code', code)

  const response = await fetch(tokenUrl.toString(), {
    method: 'GET',
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Facebook token error response:', errorText)
    throw new Error(
      `Failed to get Facebook tokens: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()
  return data
}

const getFacebookProfile = async (access_token: string) => {
  const profileUrl = new URL('https://graph.facebook.com/me')
  profileUrl.searchParams.set('fields', 'id,name,email')
  profileUrl.searchParams.set('access_token', access_token)

  const response = await fetch(profileUrl.toString())

  if (!response.ok) {
    throw new Error(
      `Failed to get Facebook profile: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()

  if (!data.email) {
    throw new Error(
      'Email is required for registration. Please allow email access in Facebook settings.',
    )
  }

  return data
}
