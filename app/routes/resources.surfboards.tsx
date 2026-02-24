import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Surfboard } from '~/types/surfboard'
import { ERROR_LOAD_SURFBOARDS } from '~/utils/errorUtils'

interface LoaderData {
  surfboards: Surfboard[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const surfboards = await get<Surfboard[]>(`surfboards?userId=${user.id}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      { surfboards },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surfboards in resource route:', error)
    return data<LoaderData>(
      {
        error: ERROR_LOAD_SURFBOARDS,
        surfboards: [],
      },
      { status: 500 },
    )
  }
}
