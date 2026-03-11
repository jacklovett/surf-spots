import { ActionFunction, data } from 'react-router'
import { post, deleteData, getDisplayMessage } from './networkService'
import { getSession, commitSession } from './session.server'
import { requireSessionCookie } from './session.server'
import { SurfSpotStatus } from '~/types/surfSpots'
import { ERROR_UPDATE_TRIP } from '~/utils/errorUtils'
import { safeLinkHref } from '~/utils/commonUtils'
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
        return data({ error: 'You must be logged in' }, { status: 401 })
      }

      const cookie = request.headers.get('Cookie') || ''
      const tripId = formData.get('tripId') as string
      const tripSpotId = formData.get('tripSpotId') as string
      const spotSurfSpotId = formData.get('surfSpotId') as string

      if (intent === 'add-spot') {
        if (!tripId || !spotSurfSpotId) {
          return data(
            { error: 'Trip ID and surf spot ID are required' },
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
            { error: 'Trip ID and trip spot ID are required' },
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
      console.error('[surfSpotAction] Error in trip action:', {
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
    return data({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const user = await requireSessionCookie(request)
    const userId = user.id

    if (!userId) {
      return data({ error: 'User not authenticated' }, { status: 401 })
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
      { success: true },
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
  const userId = user.id

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

  const forecasts = parseUrlList(
    formData,
    'forecasts',
    MAX_FORECASTS,
    'forecast links',
  )
  const webcams = parseUrlList(
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

  // ——— Coords + short text fields ———
  const longitude = parseFloat(formData.get('longitude')?.toString() || '0')
  const latitude = parseFloat(formData.get('latitude')?.toString() || '0')

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

  const ratingFormValue = formData.get('rating')?.toString()
  const rating = ratingFormValue ? parseFloat(ratingFormValue) : undefined

  // ——— Parking ———
  const parkingRaw = formData.get('parking')?.toString() || ''
  const parking = parkingRaw.trim().slice(0, MAX_PARKING_LENGTH)
  if (parkingRaw.length > MAX_PARKING_LENGTH) {
    throw new Response(
      `Parking must be at most ${MAX_PARKING_LENGTH} characters`,
      { status: 400 },
    )
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
  const newSurfSpot = {
    name,
    description,
    regionId,
    longitude,
    latitude,
    type,
    beachBottomType,
    swellDirection,
    windDirection,
    tide,
    waveDirection,
    minSurfHeight,
    maxSurfHeight,
    skillLevel,
    forecasts,
    webcams,
    boatRequired,
    isWavepool,
    wavepoolUrl: wavepoolUrlValid,
    isRiverWave,
    parking,
    foodNearby,
    foodOptions,
    accommodationNearby,
    accommodationOptions,
    facilities,
    hazards,
    rating,
    status: isPrivate ? SurfSpotStatus.PRIVATE : SurfSpotStatus.PENDING,
    userId,
  }

  return newSurfSpot
}
