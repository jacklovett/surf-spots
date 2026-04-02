import {
  data,
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
import { cacheControlHeader, get, isNetworkError } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { SurfSessionListItem } from '~/types/surfSpots'
import { formatDate } from '~/utils/dateUtils'
import { ERROR_LOAD_SESSIONS } from '~/utils/errorUtils'

interface LoaderData {
  sessions: SurfSessionListItem[]
  error?: string
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
      date. You add sessions from the spot (not from this page) so each entry is
      linked to the right place.
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
      <div className="info-page-content mv sessions-page">
        <div className="sessions-page-header">
          <h1 className="sessions-page-title">My sessions</h1>
          <TextButton
            text="Explore Surf Spots"
            onClick={() => navigate('/surf-spots')}
            iconKey="map"
            filled
          />
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
