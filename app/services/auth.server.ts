import { randomBytes } from 'node:crypto'
import { data, redirect } from 'react-router'
import type { Session } from 'react-router'
import { AuthRequest, OAuthProvider, SessionUser, User } from '~/types/user'
import { getSession, commitSession } from '~/services/session.server'
import { post, isNetworkError } from './networkService'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'
import {
  ERROR_ACCOUNT_CANT_SIGN_IN,
  ERROR_CREDENTIALS_DONT_MATCH,
  ERROR_FACEBOOK_EMAIL_REQUIRED,
  ERROR_OAUTH_SIGN_IN_FAILED,
  ERROR_RETRIEVE_PROFILE,
  ERROR_SIGN_IN,
} from '~/utils/errorUtils'

const OAUTH_STATE_KEY = 'oauth_state'

/** Build redirect response with OAuth state stored in session. Use for Google/Facebook init. */
export const createOAuthRedirectWithState = async (
  request: Request,
  buildAuthUrl: (state: string) => string,
) => {
  const state = randomBytes(32).toString('hex')
  const session = await getSession(request.headers.get('Cookie'))
  session.set(OAUTH_STATE_KEY, state)
  const cookie = await commitSession(session)
  return redirect(buildAuthUrl(state), { headers: { 'Set-Cookie': cookie } })
}

/**
 * Verify OAuth callback state and return session (with state cleared).
 * On failure returns redirect to auth with error.
 */
export const verifyOAuthStateAndGetSession = async (
  request: Request,
  searchParams: URLSearchParams,
  provider: OAuthProvider,
): Promise<{ session: Session } | Response> => {
  const stateFromProvider = searchParams.get('state')
  const session = await getSession(request.headers.get('Cookie'))
  const storedState = session.get(OAUTH_STATE_KEY)

  if (!stateFromProvider || storedState !== stateFromProvider) {
    return handleOAuthError(new Error('Invalid OAuth state'), provider)
  }

  session.unset(OAUTH_STATE_KEY)
  return { session }
}

export interface AuthErrors {
  email?: string
  password?: string
  submitError?: string
}

export interface AuthActionData {
  errors?: AuthErrors
}

export const formatEmail = (email: string) => email.toLowerCase().trim()

/**
 * Strip an API User down to the identity claims we are willing to put in the
 * signed session cookie. Keep this in sync with the SessionUser type.
 */
const toSessionUser = (user: User): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
})

export const authenticateWithCredentials = async (request: Request) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)
  if (errors) {
    return { errors }
  }

  try {
    const user = await verifyLogin(email, password)
    if (!user) {
      return data(
        { submitStatus: ERROR_CREDENTIALS_DONT_MATCH, hasError: true },
        { status: 401 },
      )
    }

    return await setSessionCookieAndRedirect(request, user)
  } catch (error) {
    console.error('Login error:', error)

    if (isNetworkError(error) && error.status !== undefined) {
      const status = error.status
      if (status === 401 || status === 404) {
        return { submitStatus: ERROR_CREDENTIALS_DONT_MATCH, hasError: true }
      }
      if (status === 403) {
        return { submitStatus: ERROR_ACCOUNT_CANT_SIGN_IN, hasError: true }
      }
      // status 0 = no response (connection/CORS/offline) – user-friendly sign-in message, not technical
      if (status === 0) {
        return {
          submitStatus: ERROR_SIGN_IN,
          hasError: true,
        }
      }
    }

    return {
      submitStatus: ERROR_SIGN_IN,
      hasError: true,
    }
  }
}

export const setSessionCookieAndRedirect = async (
  request: Request,
  user: User,
  existingSession?: Session,
) => {
  const session = existingSession ?? (await getSession(request.headers.get('Cookie')))
  session.set('user', toSessionUser(user))
  const cookie = await commitSession(session)

  if (cookie) {
    return redirect('/surf-spots', {
      headers: {
        'Set-Cookie': cookie,
      },
    })
  } else {
    throw new Error('Failed to set session cookie')
  }
}

export const verifyLogin = async (email: string, password: string) => {
  try {
    // The networkService extracts data.data from ApiResponse, so we get User directly
    const user = await post<AuthRequest, User>('auth/login', {
      email: formatEmail(email),
      password,
      provider: 'EMAIL',
    })

    if (!user || !user.id) {
      throw new Error(
        "That email and password didn't match. Try again or use Forgot password.",
      )
    }
    return user
  } catch (error) {
    throw error
  }
}

export const registerUser = async (
  authRequest: AuthRequest,
  request: Request,
  existingSession?: Session,
) => {
  const user = await post<AuthRequest, User>('auth/register', authRequest)
  if (!user) {
    throw new Error('Failed to register user')
  }
  return await setSessionCookieAndRedirect(request, user, existingSession)
}

export const validate = (email: string, password: string) => {
  const errors: AuthErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)

  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError

  return Object.keys(errors).length ? errors : null
}

const getOAuthErrorMessage = (
  error: unknown,
  provider: OAuthProvider,
): string => {
  if (!(error instanceof Error)) {
    return ERROR_OAUTH_SIGN_IN_FAILED
  }

  const msg = error.message

  if (provider === 'facebook' && msg.includes('Email is required')) {
    return ERROR_FACEBOOK_EMAIL_REQUIRED
  }

  if (msg.includes('Failed to get') && msg.includes('profile')) {
    return ERROR_RETRIEVE_PROFILE
  }

  // Tokens, network, API failures: generic message only
  return ERROR_OAUTH_SIGN_IN_FAILED
}

export const handleOAuthError = (
  error: unknown,
  provider: OAuthProvider,
): Response => {
  console.error(`${provider} OAuth error:`, error)

  const errorMessage = getOAuthErrorMessage(error, provider)
  const searchParams = new URLSearchParams({
    error: provider,
    message: encodeURIComponent(errorMessage),
  })

  return redirect(`/auth?${searchParams.toString()}`)
}
