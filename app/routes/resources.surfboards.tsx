import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Surfboard } from '~/types/surfboard'

interface LoaderData {
  surfboards: Surfboard[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<LoaderData>({ surfboards: [] }, { status: 401 })
  }

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
        error: 'Failed to load surfboards',
        surfboards: [],
      },
      { status: 500 },
    )
  }
}

