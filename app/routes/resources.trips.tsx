import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader } from '~/services/networkService'
import { getTrips } from '~/services/trip'
import { Trip } from '~/types/trip'
import { ERROR_LOAD_TRIPS } from '~/utils/errorUtils'

interface LoaderData {
  trips: Trip[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trips = await getTrips(user.id, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      { trips },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching trips in resource route:', error)
    return data<LoaderData>(
      {
        error: ERROR_LOAD_TRIPS,
        trips: [],
      },
      { status: 500 },
    )
  }
}

