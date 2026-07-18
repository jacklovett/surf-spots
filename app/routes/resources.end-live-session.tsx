import { ActionFunction, data } from 'react-router'

import { getDisplayMessage } from '~/services/networkService'
import { requireFullUserProfile } from '~/services/session.server'
import { getSurfSessionById } from '~/services/surfSession'
import { handleEndLiveSurfSession } from '~/services/surfSession.server'
import { ActionData } from '~/types/api'
import { SessionStatus } from '~/types/surfSpots'
import {
  ERROR_END_LIVE_SURF_SESSION,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_SESSION_ID_REQUIRED,
  ERROR_SURF_SESSION_NOT_FOUND,
  ERROR_SURF_SESSION_NOT_IN_PROGRESS,
} from '~/utils/errorUtils'

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return data<ActionData>(
      { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
      { status: 405 },
    )
  }

  const formData = await request.formData()
  const sessionIdRaw = formData.get('sessionId')
  const sessionId =
    typeof sessionIdRaw === 'string' && sessionIdRaw.trim() !== ''
      ? sessionIdRaw.trim()
      : ''

  if (sessionId === '') {
    return data<ActionData>(
      { submitStatus: ERROR_SESSION_ID_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  try {
    const user = await requireFullUserProfile(request)
    const cookie = request.headers.get('Cookie') ?? ''
    const session = await getSurfSessionById(sessionId, { headers: { Cookie: cookie } })

    if (session == null) {
      return data<ActionData>(
        { submitStatus: ERROR_SURF_SESSION_NOT_FOUND, hasError: true },
        { status: 404 },
      )
    }

    if (session.status !== SessionStatus.IN_PROGRESS) {
      return data<ActionData>(
        { submitStatus: ERROR_SURF_SESSION_NOT_IN_PROGRESS, hasError: true },
        { status: 400 },
      )
    }

    const skillLevel = user.skillLevel ?? session.skillLevel ?? undefined
    if (skillLevel != null) {
      formData.set('skillLevel', skillLevel)
    }

    return await handleEndLiveSurfSession(formData, sessionId, cookie, skillLevel)
  } catch (error) {
    console.error('End live session failed', error)
    if (error instanceof Response) {
      return error
    }
    return data<ActionData>(
      {
        submitStatus: getDisplayMessage(error, ERROR_END_LIVE_SURF_SESSION),
        hasError: true,
      },
      { status: 500 },
    )
  }
}
