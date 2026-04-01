import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'
import { Link } from 'react-router'
import { ContentStatus, EmptyState, Loading, Page, TextButton } from '~/components'
import { cacheControlHeader, get, isNetworkError } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import {
  CROWD_LEVEL_LABELS,
  SURF_SESSION_WAVE_QUALITY_LABELS,
  SURF_SESSION_WAVE_SIZE_LABELS,
  SurfSessionListItem,
} from '~/types/surfSpots'
import { formatDate } from '~/utils/dateUtils'
import { ERROR_LOAD_SESSIONS } from '~/utils/errorUtils'

interface LoaderData {
  sessions: SurfSessionListItem[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const sessions = await get<SurfSessionListItem[]>(
      `surf-sessions/mine?userId=${user.id}`,
      { headers: { Cookie: cookie } },
    )
    return data<LoaderData>({ sessions }, { headers: cacheControlHeader })
  } catch (error) {
    const status = isNetworkError(error) ? error.status : undefined
    return data<LoaderData>(
      { sessions: [], error: ERROR_LOAD_SESSIONS },
      { status: status && status >= 400 && status < 600 ? status : 500 },
    )
  }
}

export default function Sessions() {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const { sessions, error } = useLoaderData<LoaderData>()
  const isLoading = state === 'loading'

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
      <div className="info-page-content mv">
        <div className="row space-between mb">
          <h1>My Sessions</h1>
          <TextButton
            text="Explore Surf Spots"
            onClick={() => navigate('/surf-spots')}
            iconKey="map"
            filled
          />
        </div>

        <section
          className="sessions-how-to"
          aria-labelledby="sessions-how-to-heading"
        >
          <h2 id="sessions-how-to-heading" className="sessions-how-to-heading">
            How to add a session
          </h2>
          <p className="text-secondary sessions-how-to-lead">
            This page is your timeline of past surf sessions. You cannot add a
            session from this screen. Sessions are tied to the spot where you
            surfed so conditions stay accurate.
          </p>
          <ol className="sessions-how-to-steps">
            <li>
              Find the spot (use <strong>Explore Surf Spots</strong> above, or
              browse the map and lists).
            </li>
            <li>Open that surf spot.</li>
            <li>
              Open the spot menu and choose <strong>Save your surf</strong>.
            </li>
          </ol>
        </section>

        {sessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="When you save a session from a spot, it will appear here."
            ctaText="Explore Surf Spots"
            onCtaClick={() => navigate('/surf-spots')}
          />
        ) : (
          <div className="sessions-section">
            <div className="sessions-feed">
              {sessions.map((session) => (
                <article className="session-card" key={session.id}>
                  <div className="session-card-header">
                    <div>
                      <h2>{session.surfSpotName}</h2>
                      <p className="session-date">
                        {formatDate(session.sessionDate)}
                      </p>
                    </div>
                    <Link
                      to={session.spotPath}
                      prefetch="intent"
                      className="session-link"
                    >
                      View spot
                    </Link>
                  </div>

                  <div className="session-metrics">
                    <div className="session-metric">
                      <span>Wave Size</span>
                      <strong>
                        {SURF_SESSION_WAVE_SIZE_LABELS[session.waveSize]}
                      </strong>
                    </div>
                    <div className="session-metric">
                      <span>Crowd</span>
                      <strong>{CROWD_LEVEL_LABELS[session.crowdLevel]}</strong>
                    </div>
                    <div className="session-metric">
                      <span>Wave Quality</span>
                      <strong>
                        {SURF_SESSION_WAVE_QUALITY_LABELS[session.waveQuality]}
                      </strong>
                    </div>
                    <div className="session-metric">
                      <span>Would Surf Again</span>
                      <strong>{session.wouldSurfAgain ? 'Yes' : 'No'}</strong>
                    </div>
                    {session.surfboardName && (
                      <div className="session-metric">
                        <span>Board</span>
                        <strong>{session.surfboardName}</strong>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
