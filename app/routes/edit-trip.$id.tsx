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
import {
  extractAndValidateMemberEmails,
  addMembersToTrip,
} from '~/components/TripForm'
import { requireSessionCookie } from '~/services/session.server'
import { updateTrip } from '~/services/trip'
import { messageForDisplay } from '~/utils/errorUtils'
import { Trip, UpdateTripRequest } from '~/types/trip'
import { cacheControlHeader, get } from '~/services/networkService'
import { ActionData } from '~/types/api'

interface LoaderData {
  trip: Trip
  error?: string
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
      { submitStatus: 'Method not allowed', hasError: true },
      { status: 405 },
    )
  }

  const user = await requireSessionCookie(request)
  const tripId = params.id

  if (!tripId || !user?.id) {
    return data<ActionData>(
      { submitStatus: 'Trip not found', hasError: true },
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
        submitStatus: 'Title is required',
        hasError: true,
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
        submitStatus: 'Please enter valid email addresses for all members.',
        hasError: true,
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
        const rawMessage = error instanceof Error ? error.message : undefined
        return data<ActionData>(
          {
            submitStatus: messageForDisplay(
              rawMessage,
              'Failed to add members.',
            ),
            hasError: true,
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
        submitStatus: 'Failed to update trip. Please try again.',
        hasError: true,
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
              actionData?.submitStatus
                ? { message: actionData.submitStatus, isError: actionData.hasError || false }
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
