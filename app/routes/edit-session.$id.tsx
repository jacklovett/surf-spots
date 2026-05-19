import {
  ActionFunction,
  data,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from 'react-router'

import {
  cacheControlHeader,
  get,
  getDisplayMessage,
  httpStatusFromNetworkError,
} from '~/services/networkService'
import { requireFullUserProfile } from '~/services/session.server'
import { handleUpdateSurfSession } from '~/services/surfSpot.server'
import { getSurfSessionById } from '~/services/surfSession'
import { Surfboard } from '~/types/surfboard'
import {
  EXTERNAL_SESSION_PROVIDER_LABELS,
  ExternalSessionProvider,
  SurfSessionListItem,
} from '~/types/surfSpots'
import { ActionData } from '~/types/api'
import {
  ERROR_BOUNDARY_GENERIC,
  ERROR_LOAD_SURF_SESSION,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_SESSION_ID_REQUIRED,
  ERROR_SESSION_SKILL_LEVEL_REQUIRED,
  ERROR_SURF_SESSION_NOT_FOUND,
  ERROR_UPDATE_SURF_SESSION,
} from '~/utils/errorUtils'
import {
  ErrorBoundary,
  Page,
  SurfSessionForm,
  ContentStatus,
} from '~/components'

interface LoaderData {
  session?: SurfSessionListItem
  surfboards: Surfboard[]
  requiresSkillLevel: boolean
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
  const user = await requireFullUserProfile(request)
  const sessionId = params.id
  if (!sessionId || sessionId.trim() === '') {
    return data<LoaderData>(
      { error: ERROR_SESSION_ID_REQUIRED, surfboards: [], requiresSkillLevel: false },
      { status: 400 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const [session, surfboards] = await Promise.all([
      getSurfSessionById(sessionId, { headers: { Cookie: cookie } }),
      loadSurfboardsForUser(cookie),
    ])

    if (session == null) {
      return data<LoaderData>(
        {
          surfboards,
          requiresSkillLevel: !user.skillLevel,
          error: ERROR_SURF_SESSION_NOT_FOUND,
        },
        { status: 404 },
      )
    }

    return data<LoaderData>(
      {
        session,
        surfboards,
        requiresSkillLevel: !user.skillLevel,
      },
      { headers: cacheControlHeader },
    )
  } catch (error) {
    console.error('Edit session page: failed to load session', error)
    return data<LoaderData>(
      {
        surfboards: [],
        requiresSkillLevel: false,
        error: getDisplayMessage(error, ERROR_LOAD_SURF_SESSION),
      },
      { status: httpStatusFromNetworkError(error) },
    )
  }
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
  if (!sessionId || sessionId.trim() === '') {
    return data<ActionData>(
      { submitStatus: ERROR_UPDATE_SURF_SESSION, hasError: true },
      { status: 400 },
    )
  }

  try {
    const user = await requireFullUserProfile(request)
    const cookie = request.headers.get('Cookie') || ''
    const submittedSkillLevel = formData.get('skillLevel')
    const skillLevel =
      user.skillLevel ??
      (typeof submittedSkillLevel === 'string' ? submittedSkillLevel : undefined)

    if (!skillLevel) {
      return data<ActionData>(
        {
          submitStatus: ERROR_SESSION_SKILL_LEVEL_REQUIRED,
          hasError: true,
        },
        { status: 400 },
      )
    }

    formData.set('skillLevel', skillLevel)
    return await handleUpdateSurfSession(formData, sessionId, cookie)
  } catch (error) {
    console.error('Edit session action failed', error)
    if (error instanceof Response) {
      return error
    }
    return data<ActionData>(
      {
        submitStatus: getDisplayMessage(error, ERROR_UPDATE_SURF_SESSION),
        hasError: true,
      },
      { status: httpStatusFromNetworkError(error) },
    )
  }
}

const externalEditNoticeText = (
  provider?: ExternalSessionProvider | null,
): string | null => {
  if (provider == null) {
    return null
  }
  const label = EXTERNAL_SESSION_PROVIDER_LABELS[provider] ?? String(provider)
  return `Imported from ${label}. Edits and deletes here apply only in Surf Spots, not in ${label}.`
}

export default function EditSessionRoute() {
  const { session, surfboards, requiresSkillLevel, error } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const fetcher = useFetcher<ActionData>()

  if (error || session == null) {
    return (
      <Page showHeader>
        <ContentStatus isError={!!error}>
          <p>{error ?? ERROR_SURF_SESSION_NOT_FOUND}</p>
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <div className="mb-l">
        <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
          <SurfSessionForm
            mode="edit"
            initialSession={session}
            surfSpotId={String(session.surfSpotId)}
            surfSpotName={session.surfSpotName || 'Surf spot'}
            formActionPath={`/edit-session/${session.id}`}
            fetcher={fetcher}
            surfboards={surfboards}
            requiresSkillLevel={requiresSkillLevel}
            externalEditNotice={externalEditNoticeText(session.externalSessionProvider)}
            onCancel={() => navigate('/sessions')}
          />
        </ErrorBoundary>
      </div>
    </Page>
  )
}
