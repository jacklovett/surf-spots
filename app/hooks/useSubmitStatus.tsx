import { useEffect, useState } from 'react'
import { useActionData } from '@remix-run/react'
import { SubmitStatus } from '~/components/FormComponent'

export interface ActionData {
  submitStatus: string
  hasError: boolean
}

export const useSubmitStatus = () => {
  const actionData = useActionData<{ data: ActionData }>()
  const data = actionData?.data

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)

  useEffect(() => {
    if (data) {
      setSubmitStatus({
        message: data.submitStatus,
        isError: data.hasError,
      })

      if (!data.hasError) {
        const timeout = setTimeout(() => setSubmitStatus(null), 10000)
        return () => clearTimeout(timeout)
      }
    }
  }, [data])

  return submitStatus
}
