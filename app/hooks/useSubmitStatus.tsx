import { useActionData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { SubmitStatus } from '~/components/FormComponent'

export interface ActionData {
  submitStatus: string
  hasError: boolean
}

export const useSubmitStatus = () => {
  const actionData = useActionData<ActionData>()
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  useEffect(() => {
    if (actionData) {
      setSubmitStatus({
        message: actionData.submitStatus,
        isError: actionData.hasError,
      })

      if (!actionData.hasError) {
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [actionData])

  return submitStatus
}
