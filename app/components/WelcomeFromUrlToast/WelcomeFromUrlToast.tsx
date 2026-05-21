import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { useToastContext } from '~/contexts'
import { WELCOME_TOAST_SEARCH_PARAM } from '~/constants/postAuthRedirect'

/**
 * Shows a success toast when the URL contains {@link WELCOME_TOAST_SEARCH_PARAM}, then removes it (replace).
 * Lives under the root {@link ToastProvider} so any post-auth redirect path can carry the param.
 */
export const WelcomeFromUrlToast = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showSuccess } = useToastContext()
  const welcomeFromUrl = searchParams.get(WELCOME_TOAST_SEARCH_PARAM)

  useEffect(() => {
    if (welcomeFromUrl == null || welcomeFromUrl === '') return
    showSuccess(welcomeFromUrl)
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete(WELCOME_TOAST_SEARCH_PARAM)
        return next
      },
      { replace: true },
    )
  }, [welcomeFromUrl, setSearchParams, showSuccess])

  return null
}
