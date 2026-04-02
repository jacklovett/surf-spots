import { ActionFunction, data, redirect } from 'react-router'
import { post, deleteData, getDisplayMessage } from './networkService'
import { getSession, commitSession } from './session.server'
import { requireSessionCookie } from './session.server'
import { CrowdLevel, SurfSpotStatus } from '~/types/surfSpots'
import type { ActionData } from '~/types/api'
import {
  ERROR_CHECK_INPUT,
  ERROR_LOGIN_REQUIRED,
  ERROR_MISSING_REQUIRED_FIELDS,
  ERROR_SAVE_SURF_SESSION,
  ERROR_SURF_SPOT_ID_REQUIRED,
  ERROR_TRIP_AND_SPOT_IDS_REQUIRED,
  ERROR_TRIP_AND_TRIP_SPOT_IDS_REQUIRED,
  ERROR_UPDATE_TRIP,
  ERROR_USER_NOT_AUTHENTICATED,
  SUCCESS_SURF_SESSION_SAVED,
} from '~/utils/errorUtils'
import { isPublicSurfSpotPayloadComplete } from '~/utils/surfSpotWizardValidation'
import { safeLinkHref } from '~/utils/commonUtils'
import { roundCoordinate } from '~/utils/coordinateUtils'
import {
  MAX_ACCOMMODATION_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  MAX_FACILITIES,
  MAX_FORECASTS,
  MAX_HAZARDS,
  MAX_NAME_LENGTH,
  MAX_PARKING_LENGTH,
  MAX_SHORT_FIELD_LENGTH,
  MAX_URL_LENGTH,
  MAX_WEBCAMS,
  MAX_FOOD_OPTIONS,
} from '~/constants/surfSpotLimits'

const parseCappedStringArray = (
  formData: FormData,
  key: string,
  max: number,
  label: string,
): string[] => {
  const raw = formData.getAll(key) as string[]
  if (raw.length > max) {
    throw new Response(`At most ${max} ${label} are allowed`, { status: 400 })
  }
  return raw.slice(0, max)
}

const parseUrlList = (
  formData: FormData,
  key: string,
  max: number,
  label: string,
): string[] => {
  const raw = (formData.getAll(key) as string[]).filter(
    (u) => u != null && u.trim() !== '',
  )
  if (raw.length > max) {
    throw new Response(`At most ${max} ${label} are allowed`, { status: 400 })
  }
  const urls = raw.map((u) => safeLinkHref(u)).filter((u): u is string => u != null)
  if (urls.length !== raw.length) {
    throw new Response(
      `Each ${label.slice(0, -1)} must be a valid http or https URL`,
      { status: 400 },
    )
  }
  return urls
}

export const handleSaveSurfSession = async (
  formData: FormData,
  userId: string,
  cookie: string,
): Promise<ReturnType<typeof data>> => {
  const surfSpotIdRaw = formData.get('surfSpotId') as string
  const surfSpotId = Number(surfSpotIdRaw)
  if (surfSpotIdRaw == null || surfSpotIdRaw === '' || Number.isNaN(surfSpotId)) {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_SURF_SPOT_ID_REQUIRED,
        hasError: true,
      },
      { status: 400 },
    )
  }

  const sessionDate = (formData.get('sessionDate') as string) || ''
  const waveSize = (formData.get('waveSize') as string) || ''
  const crowdLevel = (formData.get('crowdLevel') as string) || ''
  const waveQuality = (formData.get('waveQuality') as string) || ''
  const skillLevel = formData.get('skillLevel')
  const surfboardIdRaw = (formData.get('surfboardId') as string) || ''
  const wouldSurfAgain = formData.get('wouldSurfAgain') === 'on'

  if (
    !sessionDate ||
    !waveSize ||
    !crowdLevel ||
    !waveQuality
  ) {
    return data<ActionData>(
      {
        success: false,
        submitStatus: ERROR_CHECK_INPUT,
        hasError: true,
      },
      { status: 400 },
    )
  }

  try {
    const payload: Record<string, unknown> = {
      surfSpotId,
      userId,
      sessionDate,
      waveSize,
      crowdLevel,
      waveQuality,
      wouldSurfAgain,
      skillLevel,
    }
    if (surfboardIdRaw) {
      payload.surfboardId = surfboardIdRaw
    }

    await post('surf-sessions', payload, { headers: { Cookie: cookie } })

    return data<ActionData>({
      success: true,
      submitStatus: SUCCESS_SURF_SESSION_SAVED,
      hasError: false,
    })
  } catch (error) {
    console.error('Save surf session failed:', error)
    const message = getDisplayMessage(error, ERROR_SAVE_SURF_SESSION)
    const status =
      error instanceof Error && 'status' in error
        ? (error as { status?: number }).status ?? 500
        : 500
    return data<ActionData>(
      {
        success: false,
        submitStatus: message,
        hasError: true,
      },
      { status },
    )
  }
}

export const surfSpotAction: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const intent = formData.get('intent') as string
  const actionType = formData.get('actionType') as string
  const target = formData.get('target') as string
  const surfSpotId = formData.get('surfSpotId') as string

  // ——— Trip actions (add-spot, remove-spot) ———
  if (intent === 'add-spot' || intent === 'remove-spot') {
    try {
      const user = await requireSessionCookie(request)
      if (!user?.id) {
        return data({ error: ERROR_LOGIN_REQUIRED }, { status: 401 })
      }

      const cookie = request.headers.get('Cookie') || ''
      const tripId = formData.get('tripId') as string
      const tripSpotId = formData.get('tripSpotId') as string
      const spotSurfSpotId = formData.get('surfSpotId') as string

      if (intent === 'add-spot') {
        if (!tripId || !spotSurfSpotId) {
          return data(
            { error: ERROR_TRIP_AND_SPOT_IDS_REQUIRED },
            { status: 400 },
          )
        }
        const tripSpotId = await post<undefined, string>(
          `trips/${tripId}/spots/${spotSurfSpotId}?userId=${user.id}`,
          undefined,
          { headers: { Cookie: cookie } },
        )
        return data({ success: true, tripSpotId })
      }

      if (intent === 'remove-spot') {
        if (!tripId || !tripSpotId) {
          return data(
            { error: ERROR_TRIP_AND_TRIP_SPOT_IDS_REQUIRED },
            { status: 400 },
          )
        }
        await deleteData(
          `trips/${tripId}/spots/${tripSpotId}?userId=${user.id}`,
          { headers: { Cookie: cookie } },
        )
        return data({ success: true })
      }
    } catch (error) {
      console.error('Surf spot action: trip action failed:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status:
          error instanceof Error && 'status' in error
            ? (error as { status?: number }).status
            : undefined,
      })
      return data(
        { error: getDisplayMessage(error, ERROR_UPDATE_TRIP) },
        { status: 500 },
      )
    }
  }

  // ——— Surf spot actions (watch list / surfed spots) ———
  if (!actionType || !target || !surfSpotId) {
    console.error('Missing required fields:', {
      actionType,
      target,
      surfSpotId,
    })
    return data(
      { error: ERROR_MISSING_REQUIRED_FIELDS },
      { status: 400 },
    )
  }

  try {
    const user = await requireSessionCookie(request)
    const userId = user.id

    if (!userId) {
      return data(
        { error: ERROR_USER_NOT_AUTHENTICATED },
        { status: 401 },
      )
    }

    const endpoint =
      actionType === 'add'
        ? `${target}`
        : `${target}/${userId}/remove/${surfSpotId}`

    const session = await getSession(request.headers.get('Cookie'))
    const cookie = request.headers.get('Cookie') || ''

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
      {
        success: true,
        surfSpotAction: { actionType, target },
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    )
  } catch (error) {
    console.error('Error occurred in surfSpotAction:', error)
    if (error instanceof Response) return error

    const status =
      error instanceof Error && 'status' in error
        ? (error as { status?: number }).status ?? 500
        : 500
    const message = getDisplayMessage(error)
    return data(
      { submitStatus: message, hasError: true },
      { status },
    )
  }
}

export const createSurfSpotFromFormData = async (request: Request) => {
  const user = await requireSessionCookie(request)
  const userId =
    user.id != null && String(user.id).trim() !== '' ? String(user.id) : ''
  if (!userId) {
    throw redirect('/auth')
  }

  const formData = await request.formData()

  // Handle boolean fields
  const isPrivate = formData.get('isPrivate') === 'on'
  const foodNearby = formData.get('foodNearby') === 'on'
  const accommodationNearby = formData.get('accommodationNearby') === 'on'
  const boatRequired = formData.get('boatRequired') === 'on'
  const isWavepool = formData.get('isWavepool') === 'on'
  const wavepoolUrl = formData.get('wavepoolUrl')?.toString() || null
  const isRiverWave = formData.get('isRiverWave') === 'on'

  // Handle array fields (capped to prevent abuse)
  const foodOptions = parseCappedStringArray(
    formData,
    'foodOptions',
    MAX_FOOD_OPTIONS,
    'food options',
  )
  const accommodationOptions = parseCappedStringArray(
    formData,
    'accommodationOptions',
    MAX_ACCOMMODATION_OPTIONS,
    'accommodation options',
  )

  const forecasts = isWavepool
    ? []
    : parseUrlList(
        formData,
        'forecasts',
        MAX_FORECASTS,
        'forecast links',
      )
  const webcams = isWavepool
    ? []
    : parseUrlList(
        formData,
        'webcams',
        MAX_WEBCAMS,
        'webcam links',
      )

  const facilities = parseCappedStringArray(
    formData,
    'facilities',
    MAX_FACILITIES,
    'facilities',
  )
  const hazards = parseCappedStringArray(
    formData,
    'hazards',
    MAX_HAZARDS,
    'hazards',
  )

  // ——— Required text + region ———
  const nameRaw = formData.get('name')?.toString() || ''
  const name = nameRaw.trim().slice(0, MAX_NAME_LENGTH)
  if (nameRaw.length > MAX_NAME_LENGTH) {
    throw new Response(
      `Name must be at most ${MAX_NAME_LENGTH} characters`,
      { status: 400 },
    )
  }

  const descriptionRaw = formData.get('description')?.toString() || ''
  const description = descriptionRaw.trim().slice(0, MAX_DESCRIPTION_LENGTH)
  if (descriptionRaw.length > MAX_DESCRIPTION_LENGTH) {
    throw new Response(
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
      { status: 400 },
    )
  }

  const regionIdStr = formData.get('region')?.toString() || ''
  const regionId =
    regionIdStr && regionIdStr.trim() !== '' && !isNaN(Number(regionIdStr))
      ? Number(regionIdStr)
      : undefined
  if (!regionId || isNaN(regionId)) {
    throw new Response('Region is required', { status: 400 })
  }

  // ——— Coords + short text fields (5 decimal places) ———
  const longitude = roundCoordinate(
    parseFloat(formData.get('longitude')?.toString() || '0'),
  )
  const latitude = roundCoordinate(
    parseFloat(formData.get('latitude')?.toString() || '0'),
  )

  const shortFieldKeys = [
    'type',
    'beachBottomType',
    'swellDirection',
    'windDirection',
    'tide',
    'waveDirection',
    'skillLevel',
  ] as const

  const shortFieldValues = shortFieldKeys.map((key) => {
    const value = (formData.get(key)?.toString() || '').trim()
    if (value.length > MAX_SHORT_FIELD_LENGTH) {
      throw new Response(
        `${key} must be at most ${MAX_SHORT_FIELD_LENGTH} characters`,
        { status: 400 },
      )
    }
    return value.slice(0, MAX_SHORT_FIELD_LENGTH)
  })

  const [type, beachBottomType, swellDirection, windDirection, tide, waveDirection, skillLevel] =
    shortFieldValues

  // ——— Optional numbers ———
  const minSurfHeightFormValue = formData.get('minSurfHeight')?.toString()
  const minSurfHeight = minSurfHeightFormValue
    ? parseFloat(minSurfHeightFormValue)
    : undefined

  const maxSurfHeightFormValue = formData.get('maxSurfHeight')?.toString()
  const maxSurfHeight = maxSurfHeightFormValue
    ? parseFloat(maxSurfHeightFormValue)
    : undefined

  // ——— Parking ———
  const parkingRaw = formData.get('parking')?.toString() || ''
  const parking = parkingRaw.trim().slice(0, MAX_PARKING_LENGTH)
  if (parkingRaw.length > MAX_PARKING_LENGTH) {
    throw new Response(
      `Parking must be at most ${MAX_PARKING_LENGTH} characters`,
      { status: 400 },
    )
  }

  const allowedCrowdLevels = new Set<string>(Object.values(CrowdLevel))
  const crowdLevelRaw = (formData.get('crowdLevel')?.toString() || '').trim()
  let crowdLevel: string | null = null
  if (crowdLevelRaw !== '') {
    if (!allowedCrowdLevels.has(crowdLevelRaw)) {
      throw new Response('Invalid typical crowd value', { status: 400 })
    }
    crowdLevel = crowdLevelRaw
  }

  // ——— Wavepool URL (optional, must be http(s) if present) ———
  let wavepoolUrlValid: string | null = null
  if (wavepoolUrl && wavepoolUrl.trim() !== '') {
    wavepoolUrlValid = safeLinkHref(wavepoolUrl.trim())
    if (!wavepoolUrlValid && wavepoolUrl.length <= MAX_URL_LENGTH) {
      throw new Response(
        'Wavepool URL must be a valid http or https URL',
        { status: 400 },
      )
    }
  }

  // ——— Build payload ———
  const payload = {
    name,
    description,
    regionId,
    longitude,
    latitude,
    type: type || null,
    beachBottomType: beachBottomType || null,
    swellDirection: swellDirection || null,
    windDirection: windDirection || null,
    tide: tide || null,
    waveDirection: waveDirection || null,
    minSurfHeight,
    maxSurfHeight,
    skillLevel: skillLevel || null,
    crowdLevel,
    forecasts,
    webcams,
    boatRequired,
    isWavepool,
    wavepoolUrl: wavepoolUrlValid,
    isRiverWave,
    parking: parking || null,
    foodNearby,
    foodOptions,
    accommodationNearby,
    accommodationOptions,
    facilities,
    hazards,
    status: isPrivate ? SurfSpotStatus.PRIVATE : SurfSpotStatus.PENDING,
    userId,
  }

  if (
    !isPublicSurfSpotPayloadComplete({
      status: payload.status,
      description: payload.description,
      isWavepool: payload.isWavepool,
      isRiverWave: payload.isRiverWave,
      wavepoolUrl: payload.wavepoolUrl,
      type: payload.type,
      beachBottomType: payload.beachBottomType,
      skillLevel: payload.skillLevel,
      waveDirection: payload.waveDirection,
      swellDirection: payload.swellDirection,
      windDirection: payload.windDirection,
      tide: payload.tide,
    })
  ) {
    throw new Response(ERROR_CHECK_INPUT, { status: 400 })
  }

  return payload
}
