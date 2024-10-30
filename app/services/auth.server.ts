import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { FormStrategy } from 'remix-auth-form'

import { AuthRequest, AuthUser, User } from '~/types/user'
import { sessionStorage } from '~/services/session.server'
import { post } from './networkService'

export interface AuthErrors {
  email?: string
  password?: string
  submitError?: string
}

export interface AuthActionData {
  errors?: AuthErrors
}

export const authenticator = new Authenticator<User>(sessionStorage)

// Google OAuth2 Strategy
authenticator.use(
  new GoogleStrategy<User>(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['openid', 'profile', 'email'],
    },
    async ({ profile }): Promise<User> => {
      const { displayName, emails, id } = profile
      const googleProfile: AuthUser = {
        name: displayName,
        email: emails[0].value,
        provider: 'GOOGLE',
        providerId: id,
      }
      return await saveUserToBackend(googleProfile)
    },
  ),
)

// Form-based sign-in strategy with validation and authentication
authenticator.use(
  new FormStrategy<User>(async ({ form }) => {
    const email = form.get('email') as string
    const password = form.get('password') as string

    const user = await verifyLogin(email, password)
    if (!user) {
      throw new Error('Invalid login credentials')
    }
    return user
  }),
  'form',
)

const saveUserToBackend = async (profile: AuthUser): Promise<User> => {
  const user = await post<AuthUser, User>('user/profile', profile)
  if (!user) {
    throw new Error('Account could not be approved')
  }
  return user
}

const verifyLogin = async (email: string, password: string) => {
  const user = await post<AuthRequest, User>('user/login', {
    email: formatEmail(email),
    password,
    provider: 'EMAIL',
  })
  if (!user) {
    throw new Error('Invalid login credentials')
  }
  return user
}

export const registerUser = async (email: string, password: string) => {
  const user = await post<AuthRequest, User>('user/register', {
    email: formatEmail(email),
    password,
    provider: 'EMAIL',
  })
  if (!user) {
    throw new Error('Failed to register user')
  }
  return user
}

export const validate = (email: string, password: string) => {
  const errors: AuthErrors = {}

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.'
  }

  return Object.keys(errors).length ? errors : null
}

const formatEmail = (email: string) => email.toLowerCase().trim()
