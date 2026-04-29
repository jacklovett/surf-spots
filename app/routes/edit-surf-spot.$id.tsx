import { useEffect } from 'react'
import {
  ActionFunction,
  data,
  redirect,
  LoaderFunction,
  useLoaderData,
  useNavigate,
} from 'react-router'
import { cacheControlHeader, get, patch, getDisplayMessage } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { createSurfSpotFromFormData } from '~/services/surfSpot.server'

import { Continent, SurfSpot } from '~/types/surfSpots'
import {
  ERROR_EDIT_SURF_SPOT,
  ERROR_EDIT_SURF_SPOT_FORBIDDEN,
  ERROR_LOAD_EDIT_SURF_SPOT,
  ERROR_BOUNDARY_GENERIC,
  ERROR_SURF_SPOT_ID_REQUIRED,
  SUCCESS_SURF_SPOT_UPDATED,
  httpStatusFromActionError,
} from '~/utils/errorUtils'
import SurfSpotForm, { LoaderData } from '~/components/SurfSpotForm'
import { ContentStatus, ErrorBoundary, Page } from '~/components'
import { useToastContext } from '~/contexts'

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const cookie = request.headers.get('Cookie') ?? ''
    const user = await requireSessionCookie(request)

    const { id: routeParam } = params

    if (!routeParam) {
      console.error('No id parameter found in route')
      throw new Error('Surf spot ID is required')
    }

    const isNumericId = /^\d+$/.test(routeParam)
    const surfSpot = await get<SurfSpot>(
      isNumericId
        ? `surf-spots/id/${routeParam}`
        : `surf-spots/${routeParam}`,
      {
        headers: { Cookie: cookie },
      },
    )

    if (!surfSpot) {
      throw new Error('Surf spot details not found')
    }

    // Only allow editing if user is creator
    const isOwner = surfSpot.createdBy === user.id

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
    const status = httpStatusFromActionError(error)

    const fallbackMessage =
      status === 403 ? ERROR_EDIT_SURF_SPOT_FORBIDDEN : ERROR_LOAD_EDIT_SURF_SPOT

    return data<LoaderData>(
      {
        continents: [],
        error: getDisplayMessage(error, fallbackMessage),
      },
      {
        status,
      },
    )
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const { id: routeParam } = params

  if (!routeParam) {
    return data(
      { submitStatus: ERROR_SURF_SPOT_ID_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  const requestForIdLookup = request.clone()
  const routeIsNumericId = /^\d+$/.test(routeParam)
  const actionFormData = await requestForIdLookup.formData()
  const surfSpotIdFromBody = actionFormData.get('surfSpotId')?.toString() || null
  const targetSurfSpotId = routeIsNumericId ? routeParam : surfSpotIdFromBody

  if (!targetSurfSpotId) {
    return data(
      { submitStatus: ERROR_SURF_SPOT_ID_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  try {
    const payload = await createSurfSpotFromFormData(request)
    const cookie = request.headers.get('Cookie') || ''
    const updatedSurfSpot = (await patch(
      `surf-spots/management/${targetSurfSpotId}`,
      payload,
      { headers: { Cookie: cookie } },
    )) as SurfSpot

    return data(
      {
        submitStatus: SUCCESS_SURF_SPOT_UPDATED,
        hasError: false,
        surfSpot: updatedSurfSpot,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unable to edit surf spot: ', error)
    const message = getDisplayMessage(error, ERROR_EDIT_SURF_SPOT)
    return data(
      { submitStatus: message, hasError: true },
      { status: httpStatusFromActionError(error) },
    )
  }
}

export default function EditSurfSpot() {
  const { surfSpot, error } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const { showError } = useToastContext()

  useEffect(() => {
    if (!error) return
    showError(error)
  }, [error, showError])

  const handleCancel = () => {
    if (surfSpot?.path) return navigate(surfSpot.path)
    navigate(-1)
  }

  if (!surfSpot) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>
            {error || ERROR_LOAD_EDIT_SURF_SPOT}
          </p>
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
        <SurfSpotForm actionType="Edit" onCancel={handleCancel} />
      </ErrorBoundary>
    </Page>
  )
}
