import { redirect } from 'react-router'
import { AuthRequest } from '~/types/user'
import { registerUser } from './auth.server'

// Google OAuth configuration
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
}

// TODO: Catch google errors when attempting login without first sign up

export const authenticateWithGoogle = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', googleConfig.clientId)
    url.searchParams.set('redirect_uri', googleConfig.callbackUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid profile email')

    return redirect(url.toString())
  }

  try {
    // Handle OAuth callback
    const tokens = await getGoogleTokens(code)
    const profile = await getGoogleProfile(tokens.access_token)
    const { name, email, sub } = profile

    const authRequest: AuthRequest = {
      email,
      name,
      provider: 'GOOGLE',
      providerId: sub,
    }

    return await registerUser(authRequest, request)
  } catch (error) {
    console.log(`Failed to authenticate with Google: ${error}`)
    throw error
  }
}

// Helper functions for token exchange and profile fetching
const getGoogleTokens = async (code: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: googleConfig.clientId,
      client_secret: googleConfig.clientSecret,
      code,
      redirect_uri: googleConfig.callbackUrl,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get Google tokens')
  }

  return response.json()
}

const getGoogleProfile = async (access_token: string) => {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to get Google profile')
  }

  return response.json()
}
