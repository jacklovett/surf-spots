import { ActionFunction, data, LoaderFunction, useNavigate } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get, post, getDisplayMessage } from '~/services/networkService'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'
import { Continent, SurfSpot } from '~/types/surfSpots'
import { Page, ErrorBoundary } from '~/components'
import {
  ERROR_BOUNDARY_GENERIC,
  ERROR_ADD_SURF_SPOT,
  ERROR_LOAD_CONTINENTS_ADD_SURF_SPOT,
  SUCCESS_SURF_SPOT_ADDED,
  httpStatusFromActionError,
} from '~/utils/errorUtils'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  try {
    const continentsResponse = await get<Continent[]>('continents')
    const continents = continentsResponse?.data
    // Only load continents on initial page load
    // Countries will be fetched on-demand via Mapbox + backend lookup by name
    return data(
      { continents: continents ?? [] },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching continents:', error)
    return data<LoaderData>(
      {
        continents: [],
        error: ERROR_LOAD_CONTINENTS_ADD_SURF_SPOT,
      },
      {
        status: 500,
      },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const payload = await createSurfSpotFromFormData(request)
    const cookie = request.headers.get('Cookie') || ''
    const postResponse = await post<typeof payload, SurfSpot>(
      'surf-spots/management',
      payload,
      {
        headers: { Cookie: cookie },
      },
    )
    const createdSurfSpot = postResponse?.data

    return data(
      {
        submitStatus: SUCCESS_SURF_SPOT_ADDED,
        hasError: false,
        surfSpot: createdSurfSpot,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    console.error('Unable to add surf spot: ', error)
    const message = getDisplayMessage(error, ERROR_ADD_SURF_SPOT)
    return data(
      {
        submitStatus: message,
        hasError: true,
      },
      { status: httpStatusFromActionError(error) },
    )
  }
}

export default function AddSurfSpot() {
  const navigate = useNavigate()

  return (
    <Page showHeader>
      <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
        <SurfSpotForm actionType="Add" onCancel={() => navigate(-1)} />
      </ErrorBoundary>
    </Page>
  )
}
