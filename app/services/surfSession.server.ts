import { data } from 'react-router'

import {
  getDisplayMessage,
  httpStatusFromNetworkError,
  isNetworkError,
} from '~/services/networkService'
import {
  endLiveSurfSession,
  getInProgressSurfSession,
  startLiveSurfSession,
} from '~/services/surfSession'
import { ActionData } from '~/types/api'
import { EndLiveSurfSessionRequest, SkillLevel } from '~/types/surfSpots'
import {
  ERROR_CHECK_INPUT,
  ERROR_END_LIVE_SURF_SESSION,
  ERROR_LIVE_SESSION_EXPECTED_RETURN_REQUIRED,
  ERROR_SESSION_ID_REQUIRED,
  ERROR_START_LIVE_SURF_SESSION,
  ERROR_SURF_SESSION_ALREADY_IN_PROGRESS,
  SUCCESS_SURF_SESSION_ENDED,
  SUCCESS_SURF_SESSION_STARTED,
} from '~/utils/errorUtils'

const parseOptionalNumber = (raw: FormDataEntryValue | null): number | undefined => {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

const buildEndLiveSessionPayloadFromFormData = (
  formData: FormData,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {}
  const waveSize = (formData.get('waveSize') as string) || ''
  const waveFace = (formData.get('waveFace') as string) || ''
  const crowdLevel = (formData.get('crowdLevel') as string) || ''
  const sessionRatingRaw = (formData.get('sessionRating') as string) || ''
  const tide = (formData.get('tide') as string) || ''
  const swellDirection = (formData.get('swellDirection') as string) || ''
  const windDirection = (formData.get('windDirection') as string) || ''
  const sessionNotesRaw = (formData.get('sessionNotes') as string) || ''
  const sessionNotes = sessionNotesRaw.trim().slice(0, 2000)
  const skillLevel = formData.get('skillLevel')
  const surfboardIdRaw = (formData.get('surfboardId') as string) || ''
  const surfSpotIdRaw = formData.get('surfSpotId') as string | null
  const surfSpotId =
    surfSpotIdRaw != null && surfSpotIdRaw.trim() !== ''
      ? Number(surfSpotIdRaw)
      : undefined

  const skillLevelStr =
    typeof skillLevel === 'string' && skillLevel.trim() !== ''
      ? skillLevel.trim()
      : undefined
  if (skillLevelStr) {
    payload.skillLevel = skillLevelStr
  }
  if (waveSize) {
    payload.waveSize = waveSize
  }
  if (waveFace) {
    payload.waveFace = waveFace
  }
  if (crowdLevel) {
    payload.crowdLevel = crowdLevel
  }
  if (sessionRatingRaw) {
    payload.sessionRating = Number(sessionRatingRaw)
  }
  if (tide) {
    payload.tide = tide
  }
  if (swellDirection.trim()) {
    payload.swellDirection = swellDirection.trim()
  }
  if (windDirection.trim()) {
    payload.windDirection = windDirection.trim()
  }
  if (sessionNotes) {
    payload.sessionNotes = sessionNotes
  }
  if (surfboardIdRaw) {
    payload.surfboardId = surfboardIdRaw
  }
  if (surfSpotId != null && !Number.isNaN(surfSpotId)) {
    payload.surfSpotId = surfSpotId
  }

  return payload
}

export const loadInProgressSurfSessionForUser = async (cookie: string) => {
  return getInProgressSurfSession({ headers: { Cookie: cookie } })
}

export const handleStartLiveSurfSession = async (
  formData: FormData,
  cookie: string,
): Promise<ReturnType<typeof data>> => {
  const startLatitude = parseOptionalNumber(formData.get('startLatitude'))
  const startLongitude = parseOptionalNumber(formData.get('startLongitude'))
  const hasLatitude = startLatitude != null
  const hasLongitude = startLongitude != null
  if (hasLatitude !== hasLongitude) {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_CHECK_INPUT,
        hasError: true,
      },
      { status: 400 },
    )
  }

  const hasCoordinates = hasLatitude && hasLongitude
  if (!hasCoordinates) {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_CHECK_INPUT,
        hasError: true,
      },
      { status: 400 },
    )
  }

  const shareRaw = formData.get('shareLocationWithEmergencyContact')
  const shareLocationWithEmergencyContact =
    shareRaw === 'on' || shareRaw === 'true'

  const surfboardIdRaw = (formData.get('surfboardId') as string) || ''
  const expectedReturnInstantRaw = (formData.get('expectedReturnInstant') as string) || ''
  const expectedReturnInstant = expectedReturnInstantRaw.trim()
  const startIanaZoneIdRaw = (formData.get('startIanaZoneId') as string) || ''
  const startIanaZoneId = startIanaZoneIdRaw.trim()

  if (shareLocationWithEmergencyContact && expectedReturnInstant === '') {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_LIVE_SESSION_EXPECTED_RETURN_REQUIRED,
        hasError: true,
      },
      { status: 400 },
    )
  }

  try {
    const startedSession = await startLiveSurfSession(
      {
        startLatitude,
        startLongitude,
        startIanaZoneId: startIanaZoneId !== '' ? startIanaZoneId : undefined,
        shareLocationWithEmergencyContact,
        expectedReturnInstant:
          expectedReturnInstant !== '' ? expectedReturnInstant : undefined,
        surfboardId: surfboardIdRaw.trim() !== '' ? surfboardIdRaw.trim() : undefined,
      },
      { headers: { Cookie: cookie } },
    )

    return data<ActionData>({
      success: true,
      submitStatus: SUCCESS_SURF_SESSION_STARTED,
      hasError: false,
      inProgressSession: startedSession,
    })
  } catch (error) {
    console.error('Start live surf session failed')
    if (isNetworkError(error) && error.status === 409) {
      try {
        const existingSession = await loadInProgressSurfSessionForUser(cookie)
        if (existingSession != null) {
          return data<ActionData>(
            {
              success: false,
              submitStatus: ERROR_SURF_SESSION_ALREADY_IN_PROGRESS,
              hasError: true,
              inProgressSession: existingSession,
            },
            { status: 409 },
          )
        }
      } catch (loadError) {
        console.error('Failed to load existing in-progress session after conflict', loadError)
      }
    }
    const message = getDisplayMessage(error, ERROR_START_LIVE_SURF_SESSION)
    return data<ActionData>(
      {
        success: false,
        submitStatus: message,
        hasError: true,
      },
      { status: httpStatusFromNetworkError(error) },
    )
  }
}

export const handleEndLiveSurfSession = async (
  formData: FormData,
  sessionId: string,
  cookie: string,
  skillLevel?: SkillLevel,
  successStatus: string = SUCCESS_SURF_SESSION_ENDED,
): Promise<ReturnType<typeof data>> => {
  const trimmedSessionId = sessionId.trim()
  if (!trimmedSessionId) {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_SESSION_ID_REQUIRED,
        hasError: true,
      },
      { status: 400 },
    )
  }

  const payload = buildEndLiveSessionPayloadFromFormData(formData)
  if (skillLevel) {
    payload.skillLevel = skillLevel
  }

  try {
    await endLiveSurfSession(
      trimmedSessionId,
      payload as EndLiveSurfSessionRequest,
      { headers: { Cookie: cookie } },
    )

    return data<ActionData>({
      success: true,
      submitStatus: successStatus,
      hasError: false,
    })
  } catch (error) {
    console.error('End live surf session failed')
    const message = getDisplayMessage(error, ERROR_END_LIVE_SURF_SESSION)
    return data<ActionData>(
      {
        success: false,
        submitStatus: message,
        hasError: true,
      },
      { status: httpStatusFromNetworkError(error) },
    )
  }
}
