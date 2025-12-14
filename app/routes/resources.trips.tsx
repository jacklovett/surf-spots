import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Trip } from '~/types/trip'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<Trip[]>([], { status: 401 })
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trips = await get<Trip[]>(`trips/mine?userId=${user.id}`, {
      headers: { Cookie: cookie },
    })
    return data<Trip[]>(trips, {
      headers: cacheControlHeader,
    })
  } catch (error) {
    console.error('Error fetching trips in resource route:', error)
    return data<Trip[]>([], { status: 500 })
  }
}

