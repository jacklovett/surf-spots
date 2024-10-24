import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { FormStrategy } from 'remix-auth-form'
import { AuthRequest, AuthUser, User } from '~/types/user'

import { sessionStorage } from '~/services/session.server'
import { post } from './networkService'

export const authenticator = new Authenticator<User>(sessionStorage)

// Google OAuth2 Strategy
authenticator.use(
  new GoogleStrategy<User>(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5173/auth/google/callback',
      scope: ['openid', 'profile', 'email'],
    },
    async ({ profile }): Promise<User> => {
      try {
        const googleProfile: AuthUser = {
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: 'GOOGLE',
          providerId: profile.id,
        }
        const user = await saveUserToBackend(googleProfile)
        return user
      } catch (e) {
        console.error('Error with profile: ', e)
        throw e
      }
    },
  ),
)

// Form-based login strategy for email and password authentication
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get('email') as string // Get the email from the login form
    let password = form.get('password') as string // Get the password from the login form
    // Here we call our backend to verify the user's credentials (email and password).
    // Although authentication is handled in Remix, we still need to validate
    // the user against our database for security purposes.
    const user = await verifyLogin(email, password)

    if (!user) throw new Error('Invalid email or password') // Throw an error if the login fails

    return user // Return the authenticated user for session management
  }),
)

const saveUserToBackend = async (profile: AuthUser): Promise<User> => {
  try {
    const user = await post<AuthUser, User>('user/profile', profile)
    if (!user) {
      throw new Error('No user found')
    }
    return user
  } catch (e) {
    console.error('Error while saving user to backend:', e)
    throw e
  }
}

const verifyLogin = async (email: string, password: string) => {
  try {
    const user = await post<AuthRequest, User>('/user/login', {
      username: email,
      password,
    })
    return user
  } catch (e) {
    console.error('Failed to verify login: ', e)
  }
}
