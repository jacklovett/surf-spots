import { FetcherWithComponents } from 'react-router'
import { BaseActionData } from '~/hooks/useActionFetcher'

/**
 * Utility to submit actions via fetcher with consistent error handling
 */
export const submitAction = <T extends BaseActionData = BaseActionData>(
  fetcher: FetcherWithComponents<T>,
  intent: string,
  data: Record<string, string | number>,
) => {
  const formData = new FormData()
  formData.append('intent', intent)
  
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  
  fetcher.submit(formData, { method: 'POST' })
}

/**
 * Create a reusable action submitter function
 */
export const createActionSubmitter = <T extends BaseActionData = BaseActionData>(
  fetcher: FetcherWithComponents<T>,
) => {
  return (intent: string, data: Record<string, string | number>) => {
    submitAction(fetcher, intent, data)
  }
}

