import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'

import { requireSessionCookie } from '~/services/session.server'

import {
  ContentStatus,
  ErrorBoundary,
  FeedItem,
  TripPlannerButton,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
} from '~/components'
import {
  WatchedSurfSpotsSummary,
  WatchListNotification,
} from '~/types/watchedSurfSpotsSummary'
import { cacheControlHeader, get } from '~/services/networkService'
import { useScrollReveal } from '~/hooks'

interface LoaderData {
  watchedSurfSpotsSummary?: WatchedSurfSpotsSummary
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const watchedSurfSpotsSummary = await get(`watch/${userId}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      {
        watchedSurfSpotsSummary:
          watchedSurfSpotsSummary as WatchedSurfSpotsSummary,
      },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    return data<LoaderData>(
      {
        error: `We couldn't find the updates on watched surf spots right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Watchlist() {
  const { state } = useNavigation()
  const navigate = useNavigate()
  const loading = state === 'loading'

  const { watchedSurfSpotsSummary, error } = useLoaderData<LoaderData>()
  const feedRef = useScrollReveal()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  if (loading) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  const { surfSpots: watchListSpots = [], notifications = [] } =
    watchedSurfSpotsSummary || {}

  // Dummy data for demonstration - replace with actual notifications when backend is ready
  const now = new Date()
  const dummyNotifications: WatchListNotification[] = [
    {
      id: '1',
      title: 'Pipeline Masters 2024 Registration Open',
      description:
        'The prestigious Pipeline Masters contest is now accepting registrations. This world-class event at Banzai Pipeline, Oahu will run from December 8-20, 2024. Early bird pricing available until October 15th.',
      type: 'event',
      link: 'https://example.com/pipeline-masters',
      surfSpotName: 'Banzai Pipeline',
      location: 'Oahu, Hawaii',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
    },
    {
      id: '2',
      title: 'Winter Swell Season Begins at Mavericks',
      description:
        'The prime swell season for Mavericks, California has officially started! Expect consistent big wave conditions from November through March. Water temperatures are dropping, so bring your wetsuit.',
      type: 'swell',
      surfSpotName: 'Mavericks',
      location: 'California, USA',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      title: '50% Off Surf Camp Packages - Uluwatu, Bali',
      description:
        'Exclusive deal: Book a 7-day surf camp at Uluwatu and save 50% on accommodation and lessons. Valid for bookings made before December 1st. Includes daily breakfast and equipment rental.',
      type: 'promotion',
      link: 'https://example.com/uluwatu-deal',
      surfSpotName: 'Uluwatu',
      location: 'Bali, Indonesia',
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
    },
    {
      id: '4',
      title: 'Airline Sale: Flights to Costa Rica',
      description:
        'Major airlines are offering 30% off flights to San José, Costa Rica. Perfect timing to catch the consistent waves at Playa Hermosa and Jacó. Sale ends in 48 hours.',
      type: 'promotion',
      link: 'https://example.com/flight-deal',
      location: 'Costa Rica',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(), // 1 day ago
    },
    {
      id: '5',
      title: 'Pollution Warning: Trestles Beach',
      description:
        'Recent water quality tests indicate elevated bacteria levels at Trestles, California. Health officials recommend avoiding water contact for the next 72 hours. Conditions will be re-evaluated on Friday.',
      type: 'hazard',
      surfSpotName: 'Trestles',
      location: 'California, USA',
      createdAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(), // 2 days ago
    },
    {
      id: '6',
      title: 'Summer Swell Season Ending at Jeffreys Bay',
      description:
        'The peak summer swell season at Jeffreys Bay, South Africa is coming to an end. While waves will still be surfable, the prime conditions typically end in late October. Plan your trip accordingly!',
      type: 'swell',
      surfSpotName: 'Jeffreys Bay',
      location: 'South Africa',
      createdAt: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(), // 3 days ago
    },
    {
      id: '7',
      title: 'Surf Film Festival - Raglan, New Zealand',
      description:
        'Join us for the annual Surf Film Festival at Raglan from November 15-17. Featuring premieres, Q&A sessions with pro surfers, and beach clean-up events. Free entry for all attendees.',
      type: 'event',
      link: 'https://example.com/raglan-festival',
      surfSpotName: 'Raglan',
      location: 'New Zealand',
      createdAt: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), // 1 week ago
    },
    {
      id: '8',
      title: 'Early Bird Special: Mentawai Islands Surf Charter',
      description:
        'Book your 2025 Mentawai Islands surf charter now and save 25%. Limited spots available for April-September 2025. Includes all meals, accommodation, and boat transfers.',
      type: 'promotion',
      link: 'https://example.com/mentawai-charter',
      location: 'Mentawai Islands, Indonesia',
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
    },
  ]

  // Use dummy data if no real notifications, otherwise use real data
  const displayNotifications = notifications.length > 0 
    ? notifications 
    : dummyNotifications.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA // Sort newest first
      })
  const hasNotifications = displayNotifications.length > 0
  const surfSpotsFound = watchListSpots.length > 0

  // Extract surfSpot from each WatchListSpot (backend returns wrapped objects)
  const surfSpots = watchListSpots?.map((item) => item.surfSpot)

  return (
    <Page showHeader>
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      <div className="info-page-content mv map-content">
        <h1>Watch List</h1>
        <div className="watchlist-header-actions">
          <a href="#watchlist-map" className="watchlist-spots-link">
            {surfSpotsFound
              ? `View Your Watched Spots (${surfSpots.length}) →`
              : 'View Your Watched Spots →'}
          </a>
        </div>
        <p>
          Here, we keep you updated on swell seasons, local news, events, and
          travel deals for all the surf spots you're interested in. Use these
          updates to help plan your next surf trip
        </p>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the latest updates">
          {!hasNotifications && (
            <div className="watchlist-empty-state">
              <p className="mv-l">
                No updates found for your watched surf spots
              </p>
              <p className="text-secondary">
                Add surf spots to your watch list to receive updates about
                events, swell seasons, deals, and more!
              </p>
            </div>
          )}
          {hasNotifications && (
            <div className="watchlist-feed">
              <h2 className="feed-section-title">Latest Updates</h2>
              <div ref={feedRef} className="feed-container">
                {displayNotifications.map((notification) => (
                  <FeedItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}
        </ErrorBoundary>
        <div id="watchlist-map" className="map-wrapper center">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap surfSpots={surfSpots} />
          </ErrorBoundary>
        </div>
        <div id="watched-spots">
          <ErrorBoundary message="Unable to load surf spot list">
            {!surfSpotsFound && (
              <p className="mv-l">
                No watched surf spots found. Add some spots to your watch list
                so you can stay up to date.
              </p>
            )}
            {surfSpotsFound && (
              <>
                <h2 className="watched-spots-title">Your Watched Surf Spots</h2>
                <SurfSpotList surfSpots={surfSpots} />
              </>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </Page>
  )
}
