import {
  ActionFunction,
  data,
  LoaderFunction,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  type ShouldRevalidateFunction,
} from 'react-router'

import { ErrorBoundary, Page, StartLiveSessionForm } from '~/components'
import { POST_AUTH_REDIRECT_PATH } from '~/constants/postAuthRedirect'
import { requireFullUserProfile } from '~/services/session.server'
import {
  handleStartLiveSurfSession,
  loadInProgressSurfSessionForUser,
} from '~/services/surfSession.server'
import { ActionData } from '~/types/api'
import {
  ERROR_BOUNDARY_GENERIC,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_START_LIVE_SURF_SESSION,
} from '~/utils/errorUtils'
import { getDisplayMessage } from '~/services/networkService'

interface LoaderData {
  hasEmergencyContactEmail: boolean
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireFullUserProfile(request)
  const cookie = request.headers.get('Cookie') ?? ''

  const inProgressSession = await loadInProgressSurfSessionForUser(cookie)
  if (inProgressSession != null) {
    throw redirect(POST_AUTH_REDIRECT_PATH)
  }

  const hasEmergencyContactEmail =
    typeof user.emergencyContactEmail === 'string' &&
    user.emergencyContactEmail.trim() !== ''

  return data<LoaderData>({ hasEmergencyContactEmail })
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  formMethod,
  defaultShouldRevalidate,
}) => {
  // Keep the success UI after starting; do not re-run the loader (it would redirect).
  if (
    formMethod === 'POST' &&
    typeof formAction === 'string' &&
    formAction.endsWith('/start-session')
  ) {
    return false
  }
  return defaultShouldRevalidate
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const intent = formData.get('intent') as string
  if (intent !== 'startLiveSurfSession') {
    return data<ActionData>(
      { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
      { status: 400 },
    )
  }

  try {
    const cookie = request.headers.get('Cookie') || ''
    return await handleStartLiveSurfSession(formData, cookie)
  } catch (error) {
    console.error('Start session action failed', error)
    if (error instanceof Response) {
      return error
    }
    return data<ActionData>(
      {
        submitStatus: getDisplayMessage(error, ERROR_START_LIVE_SURF_SESSION),
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function StartSessionRoute() {
  const { hasEmergencyContactEmail } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const fetcher = useFetcher<ActionData>()

  return (
    <Page showHeader>
      <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
        <StartLiveSessionForm
          formActionPath="/start-session"
          fetcher={fetcher}
          hasEmergencyContactEmail={hasEmergencyContactEmail}
          onCancel={() => navigate('/sessions')}
        />
      </ErrorBoundary>
    </Page>
  )
}
