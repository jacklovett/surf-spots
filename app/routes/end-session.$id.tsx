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
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  cacheControlHeader,
  get,
  getDisplayMessage,
  httpStatusFromNetworkError,
} from '~/services/networkService'
import {
  requireFullUserProfile,
  requireSessionCookie,
} from '~/services/session.server'
import { handleUpdateSurfSession } from '~/services/surfSpot.server'
import { getSurfSessionById } from '~/services/surfSession'
import { Surfboard } from '~/types/surfboard'
import { ActionData } from '~/types/api'
import { SessionStatus, SkillLevel, SurfSessionListItem } from '~/types/surfSpots'
import {
  ErrorBoundary,
  Page,
  SurfSessionForm,
  ContentStatus,
  ErrorRecoveryActions,
  PageErrorRecoveryActions,
  Loading,
} from '~/components'
import { liveSessionDetailsPath } from '~/constants/liveSessionPaths'
import { useEndLiveSession } from '~/hooks'
import {
  ERROR_BOUNDARY_GENERIC,
  ERROR_LOAD_SURF_SESSION,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_SESSION_ID_REQUIRED,
  ERROR_SURF_SESSION_NOT_FOUND,
  ERROR_UPDATE_SURF_SESSION,
} from '~/utils/errorUtils'
import {
  liveSessionHasSavedEndDetails,
  parseSubmittedSkillLevel,
} from '~/utils/surfSessionFormUtils'

interface LoaderData {
  session?: SurfSessionListItem
  surfboards: Surfboard[]
  requiresSkillLevel: boolean
  sessionInProgress: boolean
  showSavedSuccess: boolean
  error?: string
}

const loadSurfboardsForUser = async (
  cookie: string,
): Promise<Surfboard[]> => {
  try {
    const surfboardsResponse = await get<Surfboard[]>(`surfboards`, {
      headers: { Cookie: cookie },
    })
    return surfboardsResponse?.data ?? []
  } catch {
    return []
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireSessionCookie(request)
  const sessionId = params.id
  if (sessionId == null || sessionId.trim() === '') {
    return data<LoaderData>(
      {
        error: ERROR_SESSION_ID_REQUIRED,
        surfboards: [],
        requiresSkillLevel: false,
        sessionInProgress: false,
        showSavedSuccess: false,
      },
      { status: 400 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''
  const requestUrl = new URL(request.url)
  const showSavedSuccess = requestUrl.searchParams.get('saved') === '1'

  try {
    const [session, surfboards] = await Promise.all([
      getSurfSessionById(sessionId, { headers: { Cookie: cookie } }),
      loadSurfboardsForUser(cookie),
    ])

    if (session == null) {
      return data<LoaderData>(
        {
          surfboards,
          requiresSkillLevel: false,
          sessionInProgress: false,
          showSavedSuccess: false,
          error: ERROR_SURF_SESSION_NOT_FOUND,
        },
        { status: 404 },
      )
    }

    if (
      session.status === SessionStatus.COMPLETED &&
      !showSavedSuccess &&
      liveSessionHasSavedEndDetails(session)
    ) {
      throw redirect('/sessions')
    }

    return data<LoaderData>(
      {
        session,
        surfboards,
        requiresSkillLevel: false,
        sessionInProgress: session.status === SessionStatus.IN_PROGRESS,
        showSavedSuccess,
      },
      { headers: cacheControlHeader },
    )
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    console.error('End session page: failed to load session', error)
    return data<LoaderData>(
      {
        surfboards: [],
        requiresSkillLevel: false,
        sessionInProgress: false,
        showSavedSuccess: false,
        error: getDisplayMessage(error, ERROR_LOAD_SURF_SESSION),
      },
      { status: httpStatusFromNetworkError(error) },
    )
  }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  formMethod,
  defaultShouldRevalidate,
}) => {
  if (
    formMethod === 'POST' &&
    typeof formAction === 'string' &&
    /\/end-session\/[^/]+$/.test(formAction)
  ) {
    return false
  }
  return defaultShouldRevalidate
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()
  const intent = formData.get('intent') as string
  if (intent !== 'updateSurfSession') {
    return data<ActionData>(
      { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
      { status: 400 },
    )
  }

  const sessionId = params.id
  if (sessionId == null || sessionId.trim() === '') {
    return data<ActionData>(
      { submitStatus: ERROR_SESSION_ID_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  try {
    const user = await requireFullUserProfile(request)
    const cookie = request.headers.get('Cookie') || ''
    const session = await getSurfSessionById(sessionId, { headers: { Cookie: cookie } })
    const submittedSkillLevel = formData.get('skillLevel')
    const skillLevel: SkillLevel | undefined =
      user.skillLevel ??
      session?.skillLevel ??
      parseSubmittedSkillLevel(submittedSkillLevel)

    if (skillLevel != null) {
      formData.set('skillLevel', skillLevel)
    }

    if (session?.status !== SessionStatus.COMPLETED) {
      return data<ActionData>(
        { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
        { status: 400 },
      )
    }

    if (
      session.sessionDate != null &&
      session.sessionDate.trim() !== '' &&
      (formData.get('sessionDate') == null ||
        String(formData.get('sessionDate')).trim() === '')
    ) {
      const sessionDateValue =
        session.sessionDate.length >= 10
          ? session.sessionDate.slice(0, 10)
          : session.sessionDate
      formData.set('sessionDate', sessionDateValue)
    }

    return await handleUpdateSurfSession(formData, sessionId, cookie, {
      allowOptionalSurfSpotId: true,
    })
  } catch (error) {
    console.error('End session action failed', error)
    if (error instanceof Response) {
      return error
    }
    return data<ActionData>(
      {
        submitStatus: getDisplayMessage(error, ERROR_UPDATE_SURF_SESSION),
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function EndSessionRoute() {
  const {
    session,
    surfboards,
    requiresSkillLevel,
    sessionInProgress,
    showSavedSuccess: showSavedSuccessFromUrl,
    error,
  } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const fetcher = useFetcher<ActionData>()
  const { endSession, isEnding } = useEndLiveSession()
  const hasSubmittedEndRef = useRef(false)
  const lastHandledFetcherDataRef = useRef<typeof fetcher.data>(undefined)
  const [showSavedSuccess, setShowSavedSuccess] = useState(showSavedSuccessFromUrl)
  const [endError, setEndError] = useState<string | null>(null)

  const runEndSession = useCallback(() => {
    if (session?.id == null || isEnding) {
      return
    }
    setEndError(null)
    endSession(session.id, {
      suppressErrorToast: true,
      onSuccess: () =>
        navigate(`${liveSessionDetailsPath(session.id)}?ended=1`, { replace: true }),
      onError: (message) => setEndError(message),
    })
  }, [endSession, isEnding, navigate, session?.id])

  useEffect(() => {
    setShowSavedSuccess(showSavedSuccessFromUrl)
  }, [showSavedSuccessFromUrl])

  useEffect(() => {
    if (!sessionInProgress || session?.id == null) {
      return
    }
    if (hasSubmittedEndRef.current) {
      return
    }
    hasSubmittedEndRef.current = true
    runEndSession()
  }, [sessionInProgress, runEndSession, session?.id])

  useEffect(() => {
    if (fetcher.state !== 'idle' || fetcher.data == null) {
      return
    }
    if (fetcher.data === lastHandledFetcherDataRef.current) {
      return
    }
    lastHandledFetcherDataRef.current = fetcher.data

    if (!fetcher.data.success || fetcher.data.hasError || session?.id == null) {
      return
    }

    setShowSavedSuccess(true)
    navigate(`${liveSessionDetailsPath(session.id)}?saved=1`, { replace: true })
  }, [fetcher.data, fetcher.state, navigate, session?.id])

  if (error != null || session == null) {
    return (
      <Page showHeader>
        <ContentStatus isError actions={<PageErrorRecoveryActions />}>
          <p>{error ?? ERROR_SURF_SESSION_NOT_FOUND}</p>
        </ContentStatus>
      </Page>
    )
  }

  if (sessionInProgress && endError != null) {
    return (
      <Page showHeader>
        <ContentStatus
          isError
          actions={
            <ErrorRecoveryActions
              onRetry={runEndSession}
              retryLoading={isEnding}
              secondaryAction={{
                label: 'Go to sessions',
                onClick: () => navigate('/sessions'),
              }}
            />
          }
        >
          <p>{endError}</p>
        </ContentStatus>
      </Page>
    )
  }

  if (sessionInProgress || isEnding) {
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
      <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
        <SurfSessionForm
          mode="end"
          sessionAlreadyEnded
          sessionId={String(session.id)}
          initialSession={session}
          surfSpotId={
            session.surfSpotId != null ? String(session.surfSpotId) : ''
          }
          surfSpotName={session.surfSpotName}
          formActionPath={`/end-session/${session.id}`}
          fetcher={fetcher}
          surfboards={surfboards}
          requiresSkillLevel={requiresSkillLevel}
          initialShowSuccessScreen={showSavedSuccess}
          onCancel={() => navigate('/sessions')}
        />
      </ErrorBoundary>
    </Page>
  )
}
