import { ActionFunction, data, LoaderFunction } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get, post } from '~/services/networkService'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'
import { Continent } from '~/types/surfSpots'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  try {
    const continents = await get<Continent[]>('continents')
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
    // Send the new surf spot to the backend
    await post('surf-spots', newSurfSpot)

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
  return <SurfSpotForm actionType="Add" />
}
