import { useEffect, useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SubmitStatus } from '~/components/FormComponent'

export interface ActionData {
  submitStatus: string
  hasError: boolean
}

export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const loaderData = useLoaderData<ActionData>()

  const data = actionData || loaderData

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  useEffect(() => {
    const status = data
      ? {
          message: data?.submitStatus,
          isError: data?.hasError,
        }
      : null

    if (status) {
      setSubmitStatus(status)

      if (!status.isError) {
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
    } else {
      // Clear status if no data (e.g., after navigation)
      setSubmitStatus(null)
    }
  }, [actionData, loaderData])

  return submitStatus
}
