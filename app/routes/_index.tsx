import { RefObject } from 'react'
import type { LinksFunction, MetaFunction } from 'react-router'

import { NavButton, Icon, Footer } from '~/components'
import { useScrollReveal } from '~/hooks'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Track Your Surf Journey' },
    {
      name: 'description',
      content:
        "Track the surf spots you've surfed, discover new ones, and plan future trips. Monitor conditions, travel deals, and local events with your personalized watch list.",
    },
  ]
}

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: '/images/png/logo.png',
    as: 'image',
    type: 'image/png',
  },
]

export default function Index() {
  const featuresRef = useScrollReveal()
  const stepsRef = useScrollReveal()

  return (
    <div className="landing-page">
      <div className="main-content">
        {/* Hero Section */}
        <section className="hero column center">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-visual">
                <img
                  src="/images/png/logo.png"
                  alt="Surf Spots"
                  className="hero-logo"
                />
              </div>
              <div className="hero-text">
                <h1>Track Your Surf Journey</h1>
                <p>
                  Map every surf spot you've surfed, discover new waves, and
                  plan future trips with your personalized surf companion.
                </p>
                <div className="hero-cta">
                  <NavButton
                    label="Start Tracking"
                    to="/surf-spots"
                    variant="alternate"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <div className="section-header">
              <h2>Your Complete Surf Spot Companion</h2>
              <p>Track, discover, and plan your surf adventures</p>
            </div>

            <div
              ref={featuresRef as RefObject<HTMLDivElement>}
              className="features-grid flex-center"
            >
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <Icon iconKey="pin" useAccentColor />
                </div>
                <h3>Track Surfed Spots</h3>
                <p>
                  Log every surf spot you've surfed with ratings, reviews, and
                  memories. See your progress across countries, continents, and
                  different types of waves.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <Icon iconKey="map" useAccentColor />
                </div>
                <h3>Discover & Plan</h3>
                <p>
                  Explore new surf spots with powerful filters and plan future
                  trips. Find spots by location, wave type, difficulty, and
                  research conditions, seasons, and local information before you
                  go.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <Icon iconKey="heart" useAccentColor />
                </div>
                <h3>Watch List</h3>
                <p>
                  Keep an eye on spots for swell seasons, natural disasters,
                  sewage incidents, travel deals, and local events. Never miss
                  the perfect conditions.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <Icon iconKey="plus" useAccentColor />
                </div>
                <h3>Contribute & Share</h3>
                <p>
                  Add new surf spots to help the community. Share reviews and
                  insights, or keep your secret spots private while still
                  tracking them.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon">
                  <Icon iconKey="surfboard" useAccentColor />
                </div>
                <h3>Surf Statistics</h3>
                <p>
                  See your surf journey stats - countries visited, continents
                  surfed, types of waves ridden, and your personal surf spot
                  collection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>Start tracking your surf journey in minutes</p>
            </div>

            <div ref={stepsRef as RefObject<HTMLDivElement>} className="steps">
              <div className="step animate-on-scroll">
                <div className="step-number">1</div>
                <h3>Track Your Spots</h3>
                <p>
                  Mark surf spots you've surfed with ratings, reviews, and
                  personal notes. Build your complete surf history and see your
                  progress.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">2</div>
                <h3>Plan Your Sessions</h3>
                <p>
                  Browse new surf spots, filter by your preferences, and add
                  interesting spots to your watch list for future trips and
                  conditions.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">3</div>
                <h3>Stay Updated</h3>
                <p>
                  Monitor your watch list for swell seasons, travel deals, local
                  events, and conditions that affect your favorite spots.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="container">
            <h2>Ready to Track Your Surf Journey?</h2>
            <p>
              Join surfers worldwide who are tracking their spots, discovering
              new waves, and planning epic surf adventures.
            </p>
            <div className="cta-buttons">
              <NavButton
                label="Start Tracking"
                to="/surf-spots"
                variant="alternate"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer isAlternate={false} />
    </div>
  )
}
