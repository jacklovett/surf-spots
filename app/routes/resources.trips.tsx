import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Trip } from '~/types/trip'
import { ERROR_LOAD_TRIPS } from '~/utils/errorUtils'

interface LoaderData {
  trips: Trip[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<LoaderData>({ trips: [] }, { status: 401 })
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trips = await get<Trip[]>(`trips/mine?userId=${user.id}`, {
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

