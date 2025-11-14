import { RefObject } from 'react'
import type { LinksFunction, MetaFunction } from 'react-router'

import { NavButton, Icon, Footer } from '~/components'
import { useScrollReveal } from '~/hooks'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots: Your Surf Journey Starts Here' },
    {
      name: 'description',
      content:
        "Map every surf spot you've surfed, discover new waves, and plan epic trips. Build your surf collection, monitor conditions, and never miss the perfect session.",
    },
  ]
}

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: '/images/png/logo.png',
    as: 'image',
    type: 'image/png',
    alt: 'Surf Spots logo, your surf journey companion',
  },
]

export default function Index() {
  const featuresRef = useScrollReveal()
  const stepsRef = useScrollReveal()

  return (
    <div className="landing-page">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero column center">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-visual">
                <img
                  src="/images/png/logo.png"
                  alt="Surf Spots logo, your surf journey companion"
                  className="hero-logo"
                />
              </div>
              <div className="hero-text">
                <h1>Never Forget a Wave</h1>
                <p>
                  Remember every spot you've surfed. Get notified about deals
                  and perfect conditions. Plan your next adventure. All your
                  surf memories and future sessions in one place.
                </p>
                <div className="hero-cta">
                  <NavButton
                    label="Start Browsing Spots"
                    to="/surf-spots"
                    variant="alternate"
                    ariaLabel="Start browsing surf spots, no account required"
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
              <p>
                Map your journey, discover new breaks, and plan epic adventures
              </p>
            </div>

            <div
              ref={featuresRef as RefObject<HTMLDivElement>}
              className="features-grid flex-center"
            >
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="pin" useAccentColor />
                </div>
                <h3>Map Your Surf History</h3>
                <p>
                  Never lose track of where you've surfed. Add ratings, personal
                  notes, and memories to each spot. Watch your journey unfold
                  across countries and continents.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="map" useAccentColor />
                </div>
                <h3>Discover & Plan</h3>
                <p>
                  Find your next perfect wave with powerful filters. Search by
                  location, wave type, or difficulty. Research conditions,
                  seasons, and local insights before you travel.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="heart" useAccentColor />
                </div>
                <h3>Stay Updated</h3>
                <p>
                  Follow spots you're interested in and get notified about swell
                  seasons, travel deals, local events, and important updates.
                  Never miss the perfect conditions or a great opportunity.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="plus" useAccentColor />
                </div>
                <h3>Add Your Own Spots</h3>
                <p>
                  Contribute new surf spots to help fellow surfers, or keep your
                  secret spots private. Add personal notes about access,
                  forecast preferences, and local knowledge only you know.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="surfboard" useAccentColor />
                </div>
                <h3>Track Your Progress</h3>
                <p>
                  See your surf journey come to life. Track countries visited,
                  continents explored, favorite wave types, and watch your
                  personal collection grow over time.
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
              <p>Start building your surf collection in minutes</p>
            </div>

            <div ref={stepsRef as RefObject<HTMLDivElement>} className="steps">
              <div className="step animate-on-scroll">
                <div className="step-number">1</div>
                <h3>Log Your Sessions</h3>
                <p>
                  Mark spots you've surfed with ratings, reviews, and personal
                  notes. Build your complete surf history and watch your
                  collection grow.
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
            <h2>Ready to Never Forget a Wave?</h2>
            <p>
              Join thousands of surfers who are tracking their journey,
              discovering new breaks, and planning their next perfect session.
            </p>
            <div className="cta-buttons">
              <NavButton
                label="Start Browsing Spots"
                to="/surf-spots"
                variant="alternate"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer isAlternate={false} />
    </div>
  )
}
