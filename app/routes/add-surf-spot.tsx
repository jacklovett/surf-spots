import { ActionFunction, data, LoaderFunction, useNavigate } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get, post } from '~/services/networkService'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'
import { Continent } from '~/types/surfSpots'
import { Page, ErrorBoundary } from '~/components'

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
        error: `We're having trouble finding continents data right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const newSurfSpot = await createSurfSpotFromFormData(request)
    // Forward cookies for authentication
    const cookie = request.headers.get('Cookie') || ''
    // Send the new surf spot to the backend management endpoint
    await post('surf-spots/management', newSurfSpot, {
      headers: { Cookie: cookie },
    })

    return data(
      { submitStatus: 'Surf spot added successfully', hasError: false },
      { status: 201 },
    )
  } catch (error) {
    console.error('Unable to add surf spot: ', error)
    return data(
      {
        submitStatus: 'Unable to add surf spot. Please try again later.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function AddSurfSpot() {
  const navigate = useNavigate()

  return (
    <Page showHeader>
      <ErrorBoundary message="Something went wrong">
        <SurfSpotForm actionType="Add" onCancel={() => navigate(-1)} />
      </ErrorBoundary>
    </Page>
  )
}
