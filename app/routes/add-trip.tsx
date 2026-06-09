import {
  data,
  LoaderFunction,
  ActionFunction,
  useActionData,
  useNavigation,
  useNavigate,
  redirect,
} from 'react-router'
import {
  ErrorBoundary,
  TripForm,
  ContentStatus,
  Loading,
  Page,
} from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { CreateTripRequest, Trip } from '~/types/trip'
import { post } from '~/services/networkService'
import {
  extractAndValidateMemberEmails,
  addMembersToTrip,
} from '~/components/TripForm'
import { ActionData } from '~/types/api'
import {
  ERROR_BOUNDARY_SECTION,
  ERROR_CREATE_TRIP,
  ERROR_TRIP_DATES_REQUIRED,
  ERROR_INVALID_MEMBER_EMAILS,
  ERROR_TITLE_REQUIRED,
} from '~/utils/errorUtils'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  return data({})
}

export const action: ActionFunction = async ({ request }) => {
  await requireSessionCookie(request)

  const formData = await request.formData()
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const title = (formData.get('title') as string)?.trim()

  // Validate required fields
  if (!title || title.length === 0) {
    return data(
      { submitStatus: ERROR_TITLE_REQUIRED, hasError: true },
      { status: 400 },
    )
  }
  if (!startDate || !endDate) {
    return data(
      { submitStatus: ERROR_TRIP_DATES_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  const tripData: CreateTripRequest = {
    title,
    description: (formData.get('description') as string)?.trim() || undefined,
    startDate,
    endDate,
  }

  // Collect and validate member emails
  const { memberEmails, emailErrors } = extractAndValidateMemberEmails(formData)

  // Return validation errors if any
  if (emailErrors.length > 0) {
    return data(
      {
        submitStatus: ERROR_INVALID_MEMBER_EMAILS,
        hasError: true,
      },
      { status: 400 },
    )
  }

  try {
    const cookie = request.headers.get('Cookie') || ''
    const createTripResponse = await post<CreateTripRequest, Trip>(
      `trips`,
      tripData,
      { headers: { Cookie: cookie } },
    )
    const trip = createTripResponse?.data as Trip

    // Add members if any emails provided
    if (memberEmails.length > 0 && trip.id) {
      const { failedEmails } = await addMembersToTrip(
        trip.id,
        memberEmails,
        cookie,
        {
          throwOnFailure: false,
          handleAlreadyInvited: false,
        },
      )

      // If some members failed, show a warning but still succeed
      if (failedEmails.length > 0) {
        console.warn(`Could not add members: ${failedEmails.join(', ')}`)
      }
    }

    return redirect(`/trip/${trip.id}?success=created`)
  } catch (error) {
    console.error('Failed to create trip:', error)
    return data(
      {
        submitStatus: ERROR_CREATE_TRIP,
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function AddTrip() {
  const actionData = useActionData<ActionData>()
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading' || state === 'submitting'

  const handleCancel = () => navigate('/trips')

  if (loading) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <div className="info-page-content mv">
        <TripForm
          actionType="Add"
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
