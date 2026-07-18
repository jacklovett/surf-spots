import {
  data,
  ActionFunction,
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router'
import {
  ContentStatus,
  EmptyState,
  Loading,
  Page,
  PageErrorRecoveryActions,
  SessionLogRow,
  TextButton,
} from '~/components'
import {
  cacheControlHeader,
  get,
  getDisplayMessage,
  httpStatusFromNetworkError,
} from '~/services/networkService'
import {
  addSurfSessionMedia,
  deleteSurfSession,
  deleteSurfSessionMedia,
} from '~/services/surfSession'
import {
  redirectOnUnauthorized,
  requireSessionCookie,
} from '~/services/session.server'
import {
  SurfSessionListItem,
  SurfSessionMedia,
  UserSurfSessions,
} from '~/types/surfSpots'
import { ActionData as BaseActionData } from '~/types/api'
import { formatDate } from '~/utils/dateUtils'
import {
  ERROR_LOAD_SESSIONS,
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
  ERROR_DELETE_MEDIA,
  ERROR_DELETE_SESSION,
  ERROR_MEDIA_ID_REQUIRED,
  ERROR_INVALID_ACTION,
  ERROR_SESSION_MEDIA_FIELDS_REQUIRED,
  ERROR_SESSION_ID_REQUIRED,
} from '~/utils/errorUtils'

interface LoaderData {
  userSurfSessions?: UserSurfSessions
  error?: string
}

interface SessionsActionData extends BaseActionData {
  media?: SurfSessionMedia
}

const SessionsHowToSection = () => (
  <section
    className="sessions-how-to"
    aria-labelledby="sessions-how-to-heading"
  >
    <h2 id="sessions-how-to-heading" className="sessions-how-to-heading">
      How to add a session
    </h2>
    <p className="text-secondary sessions-how-to-lead">
      Your session history: conditions, boards, and notes tied to each spot and
      date. Use <strong>Add another session</strong> on a row below for a quick
      shortcut, or add from the surf spot (steps) so each entry stays linked to
      the right place.
    </p>
    <ol className="sessions-how-to-steps">
      <li>
        Find the spot (use <strong>Explore Surf Spots</strong> above, or browse
        the map and lists).
      </li>
      <li>Open that surf spot.</li>
      <li>
        Open the spot menu and choose <strong>Add session</strong>.
      </li>
    </ol>
  </section>
)

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const sessionsResponse = await get<UserSurfSessions>('surf-sessions', {
      headers: { Cookie: cookie },
    })
    const userSurfSessions = sessionsResponse?.data
    return data<LoaderData>({ userSurfSessions }, { headers: cacheControlHeader })
  } catch (error) {
    await redirectOnUnauthorized(error, request)
    return data<LoaderData>(
      { error: ERROR_LOAD_SESSIONS },
      { status: httpStatusFromNetworkError(error) },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  await requireSessionCookie(request)

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const cookie = request.headers.get('Cookie') ?? ''

  if (intent === 'delete-session') {
    const sessionId = formData.get('sessionId') as string
    if (!sessionId || sessionId.trim() === '') {
      return data<SessionsActionData>(
        { error: ERROR_SESSION_ID_REQUIRED },
        { status: 400 },
      )
    }
    try {
      await deleteSurfSession(sessionId.trim(), {
        headers: { Cookie: cookie },
      })
      return data<SessionsActionData>({ success: true, hasError: false })
    } catch (error) {
      console.error('Sessions action: delete session failed', { sessionId, error })
      return data<SessionsActionData>(
        { error: getDisplayMessage(error, ERROR_DELETE_SESSION) },
        { status: httpStatusFromNetworkError(error) },
      )
    }
  }

  if (intent === 'add-media') {
    const sessionId = formData.get('sessionId') as string
    const mediaId = formData.get('mediaId') as string
    const s3Url = formData.get('s3Url') as string
    const mediaType = (formData.get('mediaType') as string) || 'image'
    if (!sessionId || !mediaId || !s3Url) {
      return data<SessionsActionData>(
        { error: ERROR_SESSION_MEDIA_FIELDS_REQUIRED },
        { status: 400 },
      )
    }
    try {
      const media = await addSurfSessionMedia(
        sessionId,
        { mediaId, originalUrl: s3Url, thumbUrl: s3Url, mediaType },
        { headers: { Cookie: cookie } },
      )
      return data<SessionsActionData>({ success: true, media, hasError: false })
    } catch (error) {
      console.error('Sessions action: add session media failed', { sessionId, error })
      return data<SessionsActionData>(
        { error: getDisplayMessage(error, UPLOAD_ERROR_MEDIA_UNAVAILABLE) },
        { status: httpStatusFromNetworkError(error) },
      )
    }
  }

  if (intent === 'delete-media') {
    const mediaId = formData.get('mediaId') as string
    if (!mediaId) {
      return data<SessionsActionData>(
        { error: ERROR_MEDIA_ID_REQUIRED },
        { status: 400 },
      )
    }
    try {
      await deleteSurfSessionMedia(mediaId, {
        headers: { Cookie: cookie },
      })
      return data<SessionsActionData>({ success: true, hasError: false })
    } catch (error) {
      console.error('Sessions action: delete session media failed', { mediaId, error })
      return data<SessionsActionData>(
        { error: getDisplayMessage(error, ERROR_DELETE_MEDIA) },
        { status: httpStatusFromNetworkError(error) },
      )
    }
  }

  return data<SessionsActionData>({ error: ERROR_INVALID_ACTION }, { status: 400 })
}

export default function Sessions() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { userSurfSessions, error } = useLoaderData<LoaderData>()
  const isLoading = navigation.state === 'loading'
  const sessions: SurfSessionListItem[] = userSurfSessions?.sessions ?? []
  const totalSessions = userSurfSessions?.totalSessions ?? 0
  const spotsSurfedCount = userSurfSessions?.spotsSurfedCount ?? 0
  const boardsUsedCount = userSurfSessions?.boardsUsedCount ?? 0

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError actions={<PageErrorRecoveryActions />}>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  if (isLoading) {
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
      <div className="info-page-content mv sessions-page">
        <div className="sessions-page-header">
          <h1 className="sessions-page-title">My sessions</h1>
          <TextButton
            text="Explore Spots"
            onClick={() => navigate('/surf-spots')}
            iconKey="map"
            filled
          />
        </div>

        <div className="stats-overview mt-l">
          <div className="stat-card primary">
            <div className="stat-label bold">Sessions</div>
            <div className="stat-value">{totalSessions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label bold">Spots surfed</div>
            <div className="stat-value">{spotsSurfedCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label bold">Boards used</div>
            <div className="stat-value">{boardsUsedCount}</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <>
            <SessionsHowToSection />
            <EmptyState
              title="No sessions yet"
              description="Add a session from any surf spot to save conditions and how it went for you."
              ctaText="Explore Surf Spots"
              onCtaClick={() => navigate('/surf-spots')}
            />
          </>
        ) : (
          <>
            <div className="sessions-section">
              <h2 className="sessions-list-heading">Session history</h2>
              <p className="text-secondary sessions-list-hint">
                Tap a row for full conditions and notes. Spot name and date stay visible in the list.
              </p>
              <div className="sessions-list">
                {sessions.map((session) => (
                  <SessionLogRow
                    key={session.id}
                    session={session}
                    formatSessionDate={formatDate}
                  />
                ))}
              </div>
            </div>
            <SessionsHowToSection />
          </>
        )}
      </div>
    </Page>
  )
}
