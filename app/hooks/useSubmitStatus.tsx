import { useEffect, useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SubmitStatus } from '~/components/FormComponent'
import { ActionData } from '~/types/api'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const loaderData = useLoaderData<ActionData>()

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  useEffect(() => {
    const actionMessage =
      actionData?.submitStatus != null && typeof actionData.submitStatus === 'string'
        ? messageForDisplay(actionData.submitStatus.trim(), DEFAULT_ERROR_MESSAGE)
        : null
        
    if (actionMessage) {
      const status: SubmitStatus = {
        message: actionMessage,
        isError: !!actionData?.hasError,
      }
      setSubmitStatus(status)

      if (!status.isError) {
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
      return
    }
    
    const loaderMessage =
      loaderData?.submitStatus != null && typeof loaderData.submitStatus === 'string'
        ? messageForDisplay(loaderData.submitStatus.trim(), DEFAULT_ERROR_MESSAGE)
        : null
    if (loaderMessage) {
      const status: SubmitStatus = {
        message: loaderMessage,
        isError: !!loaderData?.hasError,
      }
      setSubmitStatus(status)

      if (!status.isError) {
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
      return
    }
    
    if (!actionMessage && !loaderMessage) {
      setSubmitStatus(null)
    }
  }, [actionData, loaderData])

  return submitStatus
}
