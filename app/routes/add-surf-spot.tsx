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
  SUCCESS_SURF_SPOT_ADDED,
  httpStatusFromActionError,
} from '~/utils/errorUtils'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  try {
    const continents = await get<Continent[]>('continents')
    // Only load continents on initial page load
    // Countries will be fetched on-demand via Mapbox + backend lookup by name
    return data(
      { continents },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching continents:', error)
    return data<LoaderData>(
      {
        continents: [],
        error: `We could not load continent data right now. Please try again later.`,
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
    const createdSurfSpot = (await post('surf-spots/management', payload, {
      headers: { Cookie: cookie },
    })) as SurfSpot

    return data(
      {
        submitStatus: SUCCESS_SURF_SPOT_ADDED,
        hasError: false,
        surfSpot: createdSurfSpot,
      },
      { status: 201 },
    )
  } catch (error) {
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
