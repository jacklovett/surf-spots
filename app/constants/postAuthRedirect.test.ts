import { describe, expect, it } from 'vitest'

import {
  buildPostAuthRedirectPathWithSearch,
  POST_AUTH_REDIRECT_PATH,
  WELCOME_TOAST_SEARCH_PARAM,
} from './postAuthRedirect'

describe('buildPostAuthRedirectPathWithSearch', () => {
  it('should return the default path without a welcome message', () => {
    expect(buildPostAuthRedirectPathWithSearch()).toBe(POST_AUTH_REDIRECT_PATH)
    expect(buildPostAuthRedirectPathWithSearch({ welcomeMessage: '  ' })).toBe(
      POST_AUTH_REDIRECT_PATH,
    )
  })

  it('should append an encoded welcome query param', () => {
    const path = buildPostAuthRedirectPathWithSearch({
      welcomeMessage: 'Welcome back!',
    })
    expect(path).toBe(
      `${POST_AUTH_REDIRECT_PATH}?${WELCOME_TOAST_SEARCH_PARAM}=Welcome%20back!`,
    )
  })
})
