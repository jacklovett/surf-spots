import { Link, MetaFunction, useNavigate } from 'react-router'
import { useUserContext } from '~/contexts'
import { Button, Chip, Icon, Page } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Trip Planner' },
    {
      name: 'description',
      content:
        'Trip Planner - Coming soon. Get personalized AI-powered surf destination recommendations based on your surfed spots and watch list.',
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
          We're excited to announce that we're working on an AI-powered trip
          planner that will help you discover your next perfect surf
          destination!
        </p>

        <section>
          <h2 className="mb">How It Works</h2>
          <p className="mb">
            Our AI trip planner analyzes your personal surf data to provide
            personalized recommendations:
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
            The more spots you add to your surfed spots and watch list, the
            better the AI can understand your preferences and provide tailored
            recommendations!
          </p>
        </section>

        {!isLoggedIn && (
          <div className="mt">
            <p className="mb bold">Stay notified when Trip Planner is ready!</p>
            <p className="mb font-small">
              Create an account and start building your surfed spots and watch
              list now. The more data you add, the better your trip planner
              recommendations will be when it launches!
            </p>
            <div className="mb">
              <Button
                label="Create an Account"
                onClick={() => navigate('/auth/sign-up')}
                variant="primary"
              />
            </div>
            <Link to="/auth" prefetch="intent" className="font-small">
              Already have an account? Sign in
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <div className="mt">
            <p className="mb bold">
              Thank you for being part of our community!
            </p>
            <p className="font-small">
              We'll notify you as soon as Trip Planner is ready. Stay tuned!
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
