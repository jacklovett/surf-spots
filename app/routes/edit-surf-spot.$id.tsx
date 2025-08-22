import { ActionFunction, data, redirect } from 'react-router'

import { cacheControlHeader, edit, get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import { Continent, SurfSpot } from '~/types/surfSpots'

import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'

export const loader = async (
  request: Request,
  params: { surfSpotId: string },
) => {
  try {
    const user = await requireSessionCookie(request)

    const { surfSpotId } = params

    const surfSpot = await get<SurfSpot>(`/api/surf-spots/${surfSpotId}`)

    if (!surfSpot) {
      throw new Error('Surf spot details not found')
    }

    // Only allow editing if user is creator
    const isOwner = user && surfSpot.createdBy === user.id

    if (!isOwner) {
      // TODO: Does this need a dedicated page?
      throw redirect('/surf-spots')
    }

    const continents = await get<Continent[]>('continents')

    return data<LoaderData>(
      { continents, surfSpot, error: '' },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching data for edit form:', error)
    return data<LoaderData>(
      {
        continents: [],
        error: `We're having trouble finding the data for this surf spot right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const updatedSurfSpot = await createSurfSpotFromFormData(request)

  try {
    // Send the updated surf spot to the backend
    await edit('surf-spots', updatedSurfSpot)

    return data(
      { submitStatus: 'Surf spot edited successfully', hasError: false },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unable to edit surf spot: ', error)
    return data(
      {
        submitStatus: 'Unable to edit surf spot. Please try again later.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function EditSurfSpot() {
  return <SurfSpotForm actionType="Edit" />
}
