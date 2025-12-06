import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useActionData,
  useNavigate,
  useNavigation,
  redirect,
} from 'react-router'
import {
  ErrorBoundary,
  ContentStatus,
  Loading,
  Page,
  TripForm,
} from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { updateTrip } from '~/services/trip'
import { Trip, UpdateTripRequest } from '~/types/trip'
import { cacheControlHeader, get } from '~/services/networkService'
import {
  extractAndValidateMemberEmails,
  addMembersToTrip,
} from '~/components/TripForm'

interface LoaderData {
  trip: Trip
  error?: string
}

interface ActionData {
  success?: boolean
  error?: string | null
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id
  const tripId = params.id

  if (!tripId) {
    return data<LoaderData>(
      { error: 'Trip not found', trip: {} as Trip },
      { status: 404 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trip = await get<Trip>(`trips/${tripId}?userId=${userId}`, {
      headers: { Cookie: cookie },
    })

    // Only allow editing if user is owner
    if (!trip.isOwner) {
      return redirect(`/trip/${tripId}`)
    }

    return data<LoaderData>(
      { trip },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching trip:', error)
    return data<LoaderData>(
      {
        error: `We couldn't load this trip right now. Please try again later.`,
        trip: {} as Trip,
      },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ params, request }) => {
  // Only handle PUT requests for updates
  if (request.method !== 'PUT') {
    return data<ActionData>(
      { error: 'Method not allowed', success: false },
      { status: 405 },
    )
  }

  const user = await requireSessionCookie(request)
  const { tripId } = params

  if (!tripId || !user?.id) {
    return data<ActionData>(
      { error: 'Trip not found', success: false },
      { status: 404 },
    )
  }

  const formData = await request.formData()
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const title = (formData.get('title') as string)?.trim()

  // Validate required fields
  if (!title || title.length === 0) {
    return data<ActionData>(
      {
        error: 'Title is required',
        success: false,
      },
      { status: 400 },
    )
  }

  const tripData: UpdateTripRequest = {
    title,
    description: (formData.get('description') as string)?.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }

  // Collect and validate member emails
  const { memberEmails, emailErrors } = extractAndValidateMemberEmails(formData)

  // Return validation errors if any
  if (emailErrors.length > 0) {
    return data<ActionData>(
      {
        error: 'Please enter valid email addresses for all members.',
        success: false,
      },
      { status: 400 },
    )
  }

  try {
    const cookie = request.headers.get('Cookie') || ''
    await updateTrip(tripId, user.id, tripData, {
      headers: { Cookie: cookie },
    })

    // Add members if any emails provided
    if (memberEmails.length > 0) {
      try {
        const { failedEmails, alreadyInvitedEmails } = await addMembersToTrip(
          tripId,
          user.id,
          memberEmails,
          cookie,
          {
            throwOnFailure: true,
            handleAlreadyInvited: true,
          },
        )
      } catch (error) {
        // Error message is already formatted by addMembersToTrip
        return data<ActionData>(
          {
            error:
              error instanceof Error ? error.message : 'Failed to add members',
            success: false,
          },
          { status: 400 },
        )
      }
    }

    return redirect(`/trip/${tripId}`)
  } catch (error) {
    console.error('Failed to update trip:', error)
    return data<ActionData>(
      {
        error: 'Failed to update trip. Please try again.',
        success: false,
      },
      { status: 500 },
    )
  }
}

export default function EditTrip() {
  const { trip, error } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading' || state === 'submitting'

  const handleCancel = () => {
    navigate(`/trip/${trip.id}`, { replace: true })
  }

  if (error) {
    return (
      <ContentStatus isError>
        <p>{error}</p>
      </ContentStatus>
    )
  }

  if (loading) {
    return (
      <ContentStatus>
        <Loading />
      </ContentStatus>
    )
  }

  return (
    <Page showHeader>
      <ErrorBoundary message="Something went wrong loading the trip form">
        <div className="info-page-content mv">
          <TripForm
            actionType="Edit"
            trip={trip}
            submitStatus={
              actionData?.error
                ? { message: actionData.error, isError: true }
                : null
            }
            onCancel={handleCancel}
            allowMembers
          />
        </div>
      </ErrorBoundary>
    </Page>
  )
}
