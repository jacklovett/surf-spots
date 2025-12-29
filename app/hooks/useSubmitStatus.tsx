import { useEffect, useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SubmitStatus } from '~/components/FormComponent'
import { ActionData } from '~/types/api'

export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const loaderData = useLoaderData<ActionData>()

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  useEffect(() => {
    // Prefer actionData - it persists until the next action
    if (actionData?.submitStatus) {
      const status = {
        message: actionData.submitStatus,
        isError: actionData.hasError,
      }
      setSubmitStatus(status)

      if (!status.isError) {
        // Clear after 10 seconds for success messages
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
      return
    }
    
    if (loaderData?.submitStatus) {
      // Fallback to loaderData if actionData doesn't have submitStatus
      const status = {
        message: loaderData.submitStatus,
        isError: loaderData.hasError,
      }
      setSubmitStatus(status)

      if (!status.isError) {
        // Clear after 10 seconds for success messages
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
      return
    }
    
    // Only clear if we have no actionData and no loaderData with submitStatus
    // This prevents clearing when loader re-runs after staying on same page
    if (!actionData && !loaderData?.submitStatus) {
      setSubmitStatus(null)
    }
  }, [actionData, loaderData])

  return submitStatus
}
