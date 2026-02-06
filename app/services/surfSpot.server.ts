import { ActionFunction, data } from 'react-router'
import { post, deleteData } from './networkService'
import { getSession, commitSession } from './session.server'
import { requireSessionCookie } from './session.server'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'
import { SurfSpotStatus } from '~/types/surfSpots'

export const surfSpotAction: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const intent = formData.get('intent') as string
  const actionType = formData.get('actionType') as string
  const target = formData.get('target') as string
  const surfSpotId = formData.get('surfSpotId') as string

  // Handle trip actions (add-spot, remove-spot)
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
      } else if (intent === 'remove-spot') {
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
        status: error instanceof Error && 'status' in error ? (error as { status?: number }).status : undefined,
      })
      const rawMessage = error instanceof Error ? error.message : undefined
      return data(
        {
          error: messageForDisplay(
            rawMessage,
            'Failed to update trip. Please try again.',
          ),
        },
        { status: 500 },
      )
    }
  }

  // Handle surf spot actions (add/remove from watch list or surfed spots)
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
    const message =
      error instanceof Error
        ? messageForDisplay(error.message, DEFAULT_ERROR_MESSAGE)
        : DEFAULT_ERROR_MESSAGE
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

  // Handle array fields
  const foodOptions = formData.getAll('foodOptions') as string[]
  const accommodationOptions = formData.getAll(
    'accommodationOptions',
  ) as string[]
  const forecasts = formData.getAll('forecasts') as string[]
  const facilities = formData.getAll('facilities') as string[]
  const hazards = formData.getAll('hazards') as string[]
  // Handle other fields
  const name = formData.get('name')?.toString() || ''
  const description = formData.get('description')?.toString() || ''
  const regionIdStr = formData.get('region')?.toString() || ''
  // Convert to number - only if string is not empty and is a valid number
  const regionId =
    regionIdStr && regionIdStr.trim() !== '' && !isNaN(Number(regionIdStr))
      ? Number(regionIdStr)
      : undefined

  // Region is required - validate before proceeding
  if (!regionId || isNaN(regionId)) {
    throw new Response('Region is required', { status: 400 })
  }

  const longitude = parseFloat(formData.get('longitude')?.toString() || '0')
  const latitude = parseFloat(formData.get('latitude')?.toString() || '0')
  const type = formData.get('type')?.toString() || ''
  const beachBottomType = formData.get('beachBottomType')?.toString() || ''
  const swellDirection = formData.get('swellDirection')?.toString() || ''
  const windDirection = formData.get('windDirection')?.toString() || ''
  const tide = formData.get('tide')?.toString() || ''
  const waveDirection = formData.get('waveDirection')?.toString() || ''

  const minSurfHeightFormValue = formData.get('minSurfHeight')?.toString()
  const minSurfHeight = minSurfHeightFormValue
    ? parseFloat(minSurfHeightFormValue)
    : undefined
  const maxSurfHeightFormValue = formData.get('maxSurfHeight')?.toString()
  const maxSurfHeight = maxSurfHeightFormValue
    ? parseFloat(maxSurfHeightFormValue)
    : undefined

  const skillLevel = formData.get('skillLevel')?.toString() || ''

  const ratingFormValue = formData.get('rating')?.toString()
  const rating = ratingFormValue ? parseFloat(ratingFormValue) : undefined

  const parking = formData.get('parking')?.toString() || ''

  // Construct the new surf spot object
  // regionId is guaranteed to be valid at this point due to validation above
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
    boatRequired,
    isWavepool,
    wavepoolUrl,
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
