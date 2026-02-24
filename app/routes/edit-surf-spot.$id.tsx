import {
  ActionFunction,
  data,
  redirect,
  LoaderFunction,
  useLoaderData,
  useNavigate,
} from 'react-router'
import { cacheControlHeader, edit, get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import { Continent, SurfSpot } from '~/types/surfSpots'
import { ERROR_EDIT_SURF_SPOT } from '~/utils/errorUtils'
import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await requireSessionCookie(request)

    const { id } = params

    if (!id) {
      console.error('No id parameter found in route')
      throw new Error('Surf spot ID is required')
    }

    const surfSpot = await get<SurfSpot>(
      `surf-spots/id/${id}?userId=${user.id}`,
    )

    if (!surfSpot) {
      throw new Error('Surf spot details not found')
    }

    // Only allow editing if user is creator
    const isOwner = user && surfSpot.createdBy === user.id

    if (!isOwner) {
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

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params

  if (!id) {
    return data(
      { submitStatus: 'Surf spot ID is required', hasError: true },
      { status: 400 },
    )
  }

  const updatedSurfSpot = await createSurfSpotFromFormData(request)
  try {
    // Forward cookies for authentication
    const cookie = request.headers.get('Cookie') || ''
    // Send the updated surf spot to the backend management endpoint
    await edit(`surf-spots/management/${id}`, updatedSurfSpot, {
      headers: { Cookie: cookie },
    })

    return redirect(`/surf-spots/id/${id}?success`)
  } catch (error) {
    console.error('Unable to edit surf spot: ', error)
    return data(
      {
        submitStatus: ERROR_EDIT_SURF_SPOT,
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function EditSurfSpot() {
  const { surfSpot } = useLoaderData<LoaderData>()
  const navigate = useNavigate()

  const handleCancel = () => {
    if (surfSpot?.id) {
      navigate(`/surf-spots/id/${surfSpot.id}`)
    } else {
      navigate(-1)
    }
  }

  return <SurfSpotForm actionType="Edit" onCancel={handleCancel} />
}
