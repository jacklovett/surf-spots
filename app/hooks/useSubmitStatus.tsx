import { useEffect, useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SubmitStatus } from '~/components/FormComponent'
import { ActionData } from '~/types/api'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

const readSubmitStatusFromRouteData = (
  actionData?: ActionData,
  loaderData?: ActionData,
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

export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const loaderData = useLoaderData<ActionData>()

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(() =>
    readSubmitStatusFromRouteData(actionData, loaderData),
  )

  useEffect(() => {
    const nextStatus = readSubmitStatusFromRouteData(actionData, loaderData)
    setSubmitStatus(nextStatus)

    if (nextStatus && !nextStatus.isError) {
      const timeout = setTimeout(() => setSubmitStatus(null), 10000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [actionData, loaderData])

  return submitStatus
}
