import { Link, MetaFunction, useNavigate } from 'react-router'
import { useUserContext } from '~/contexts'
import { Button, Chip, Page } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Trip Planner' },
    {
      name: 'description',
      content:
        'Trip Planner – Coming soon. Get personalized surf destination ideas based on your surfed spots and watch list.',
    },
  ]
}

export default function TripPlanner() {
  const { user } = useUserContext()
  const navigate = useNavigate()
  const isLoggedIn = !!user

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div className="page-title-with-status">
          <h1>Trip Planner</h1>
          <Chip label="Coming Soon" isFilled={false} />
        </div>

        <p className="mb">
          We are building a trip planner to help you discover your next surf
          destination based on your surf history and watch list.
        </p>

        <section>
          <h2 className="mb">How It Will Work</h2>
          <p className="mb">
            The trip planner will use your surf history to suggest places to explore:
          </p>
          <ul className="benefits-list mb">
            <li>
              Uses your surfed spots and watch list to understand your
              preferences
            </li>
            <li>
              Learns from your surf history to suggest similar or complementary
              destinations
            </li>
            <li>
              Chat with the AI to get personalized recommendations for where to
              surf next
            </li>
            <li>
              Receive trip planning suggestions based on your past experiences
            </li>
            <li>
              Discover new spots that match your surfing style and preferences
            </li>
          </ul>
          <p className="mb">
            The more spots you add to your surfed spots, trips, and watch list, the
            better the recommendations.
          </p>
        </section>

        {!isLoggedIn && (
          <div className="mt">
            <p className="mb bold">Join the waitlist for Trip Planner</p>
            <p className="mb font-small">
              Be among the first to try the trip planner. Create an account to join
              the waitlist and start adding your surfed spots and watch list. The
              more you save, the better your recommendations when it launches.
            </p>
            <div className="mb column center-vertical gap">
              <Button
                label="Create account"
                onClick={() => navigate('/auth/sign-up')}
                variant="primary"
                ariaLabel="Create an account to join the Trip Planner waitlist"
              />
              <Link to="/auth" prefetch="intent" className="font-small">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="mt">
            <p className="mb bold">
              Thanks for being part of the community.
            </p>
            <p className="font-small">
              We will notify you when Trip Planner is ready.
            </p>
            <p className="font-small mt">
              Start building your surfed spots and watch list now to get the
              best recommendations when it launches!
            </p>
          </div>
        )}
      </div>
    </Page>
  )
}
