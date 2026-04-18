import {
  data,
  ActionFunction,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'
import {
  ContentStatus,
  EmptyState,
  Loading,
  Page,
  SessionLogRow,
  TextButton,
} from '~/components'
import {
  cacheControlHeader,
  get,
  getDisplayMessage,
  isNetworkError,
} from '~/services/networkService'
import {
  addSurfSessionMedia,
  deleteSurfSessionMedia,
} from '~/services/surfSession'
import { requireSessionCookie } from '~/services/session.server'
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
  const user = await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const userSurfSessions = await get<UserSurfSessions>(`surf-sessions/${user.id}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>({ userSurfSessions }, { headers: cacheControlHeader })
  } catch (error) {
    const status = isNetworkError(error) ? error.status : undefined
    return data<LoaderData>(
      { error: ERROR_LOAD_SESSIONS },
      { status: status && status >= 400 && status < 600 ? status : 500 },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<SessionsActionData>({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const cookie = request.headers.get('Cookie') ?? ''

  if (intent === 'add-media') {
    const sessionId = formData.get('sessionId') as string
    const s3Url = formData.get('s3Url') as string
    const mediaType = (formData.get('mediaType') as string) || 'image'
    if (!sessionId || !s3Url) {
      return data<SessionsActionData>(
        { error: 'Session and media URL are required' },
        { status: 400 },
      )
    }
    try {
      const media = await addSurfSessionMedia(
        sessionId,
        user.id,
        { originalUrl: s3Url, thumbUrl: s3Url, mediaType },
        { headers: { Cookie: cookie } },
      )
      return data<SessionsActionData>({ success: true, media })
    } catch (error) {
      console.error('Sessions action: add session media failed', { sessionId, error })
      return data<SessionsActionData>(
        { error: getDisplayMessage(error, UPLOAD_ERROR_MEDIA_UNAVAILABLE) },
        { status: 500 },
      )
    }
  }

  if (intent === 'delete-media') {
    const mediaId = formData.get('mediaId') as string
    if (!mediaId) {
      return data<SessionsActionData>(
        { error: 'Media ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteSurfSessionMedia(mediaId, user.id, {
        headers: { Cookie: cookie },
      })
      return data<SessionsActionData>({ success: true })
    } catch (error) {
      console.error('Sessions action: delete session media failed', { mediaId, error })
      return data<SessionsActionData>(
        { error: getDisplayMessage(error, ERROR_DELETE_MEDIA) },
        { status: 500 },
      )
    }
  }

  return data<SessionsActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function Sessions() {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const { userSurfSessions, error } = useLoaderData<LoaderData>()
  const isLoading = state === 'loading'
  const sessions: SurfSessionListItem[] = userSurfSessions?.sessions ?? []
  const totalSessions = userSurfSessions?.totalSessions ?? 0
  const spotsSurfedCount = userSurfSessions?.spotsSurfedCount ?? 0
  const boardsUsedCount = userSurfSessions?.boardsUsedCount ?? 0

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError>
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
              description="Add a session from any surf spot to track conditions and how it went for you."
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
