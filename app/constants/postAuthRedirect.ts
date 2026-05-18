/**
 * One-shot success message after register / OAuth, passed in the URL and stripped by the app shell.
 * Keep in sync with {@link buildPostAuthRedirectPathWithSearch}.
 */
export const WELCOME_TOAST_SEARCH_PARAM = 'welcome'

/**
 * Default path after session is established (email login, register, OAuth).
 * Change here only; toast handling reads {@link WELCOME_TOAST_SEARCH_PARAM} on whatever URL you redirect to.
 */
export const POST_AUTH_REDIRECT_PATH = '/surf-spots'

export const buildPostAuthRedirectPathWithSearch = (options?: {
  welcomeMessage?: string | null
}): string => {
  const trimmedWelcome = options?.welcomeMessage?.trim()
  if (trimmedWelcome != null && trimmedWelcome !== '') {
    return `${POST_AUTH_REDIRECT_PATH}?${WELCOME_TOAST_SEARCH_PARAM}=${encodeURIComponent(trimmedWelcome)}`
  }
  return POST_AUTH_REDIRECT_PATH
}
