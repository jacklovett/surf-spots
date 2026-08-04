import { useEffect, useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SubmitStatus } from '~/components/FormComponent'
import { ActionData } from '~/types/api'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

const readSubmitStatusFromRouteData = (
  actionData?: ActionData | null,
  loaderData?: ActionData | null,
): SubmitStatus | null => {
  const trimmedActionMessage =
    actionData?.submitStatus != null && typeof actionData.submitStatus === 'string'
      ? messageForDisplay(actionData.submitStatus.trim(), DEFAULT_ERROR_MESSAGE)
      : null

  if (trimmedActionMessage) {
    return {
      message: trimmedActionMessage,
      isError: !!actionData?.hasError,
    }
  }

  const trimmedLoaderMessage =
    loaderData?.submitStatus != null && typeof loaderData.submitStatus === 'string'
      ? messageForDisplay(loaderData.submitStatus.trim(), DEFAULT_ERROR_MESSAGE)
      : null

  if (trimmedLoaderMessage) {
    return {
      message: trimmedLoaderMessage,
      isError: !!loaderData?.hasError,
    }
  }

  return null
}

/**
 * Prefer route loader/action data during render (SSR + hydration must match).
 * Only use state to auto-dismiss success banners after a timeout.
 */
export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const loaderData = useLoaderData<ActionData | null>()
  const fromRoute = readSubmitStatusFromRouteData(actionData, loaderData)

  const [dismissedSuccessMessage, setDismissedSuccessMessage] = useState<
    string | null
  >(null)

  const routeMessage = fromRoute?.message ?? null
  const routeIsError = fromRoute?.isError ?? false

  useEffect(() => {
    if (!routeMessage || routeIsError) {
      setDismissedSuccessMessage(null)
      return undefined
    }

    const timeout = setTimeout(() => {
      setDismissedSuccessMessage(routeMessage)
    }, 10000)
    return () => clearTimeout(timeout)
  }, [routeMessage, routeIsError])

  if (!fromRoute) {
    return null
  }
  if (!fromRoute.isError && dismissedSuccessMessage === fromRoute.message) {
    return null
  }
  return fromRoute
}
