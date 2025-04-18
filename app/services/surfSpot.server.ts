import { ActionFunction, data } from 'react-router'
import { post, deleteData } from './networkService'
import { getSession, commitSession } from './session.server'

export const surfSpotAction: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const actionType = formData.get('actionType') as string
  const target = formData.get('target') as string
  const surfSpotId = formData.get('surfSpotId') as string
  const userId = formData.get('userId') as string

  if (!actionType || !target || !surfSpotId || !userId) {
    console.error('Missing required fields:', {
      actionType,
      target,
      surfSpotId,
      userId,
    })
    return data({ error: 'Missing required fields' }, { status: 400 })
  }

  const endpoint =
    actionType === 'add'
      ? `${target}`
      : `${target}/${userId}/remove/${surfSpotId}`

  try {
    const session = await getSession(request.headers.get('Cookie'))
    const cookie = request.headers.get('Cookie') || ''

    console.log('Forwarding request to backend:', { endpoint, actionType })
    if (actionType === 'add') {
      await post(
        endpoint,
        { userId, surfSpotId },
        { headers: { Cookie: cookie } },
      )
    } else {
      await deleteData(endpoint, { headers: { Cookie: cookie } })
    }

    return data(
      { success: true },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    )
  } catch (error) {
    console.error('Error occurred in surfSpotAction:', error)
    if (error instanceof Response) return error
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return data(
        { submitStatus: error.message, hasError: true },
        { status: 400 },
      )
    }
    return data(
      {
        submitStatus: 'An unexpected error occurred. Please try again.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}
