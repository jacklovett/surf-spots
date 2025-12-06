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
        "Map every surf spot you've surfed, discover new waves, plan epic trips with friends, and build your surf collection. Monitor conditions, track your journey, and never miss the perfect session.",
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
  const trackFeaturesRef = useScrollReveal()
  const planFeaturesRef = useScrollReveal()
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
                  Track every spot you've surfed, discover thousands of breaks
                  worldwide, and plan trips with friends. Your complete surf
                  companion from first paddle out to epic adventures.
                </p>
                <div className="hero-cta">
                  <NavButton
                    label="Start Browsing Spots"
                    to="/surf-spots"
                    variant="secondary"
                    ariaLabel="Start browsing surf spots, no account required"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track Your Journey Section */}
        <section className="features">
          <div className="container">
            <div className="section-header">
              <h2>Track Your Journey</h2>
              <p>Build your personal collection of surfed spots</p>
            </div>

            <div
              ref={trackFeaturesRef as RefObject<HTMLDivElement>}
              className="features-grid flex-center"
            >
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="pin" useAccentColor />
                </div>
                <h3>Your Surf Map</h3>
                <p>
                  Log every session with ratings and notes. Watch your
                  collection grow across the globe.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="surfboard" useAccentColor />
                </div>
                <h3>Your Stats</h3>
                <p>
                  How many spots? Which countries? What wave types? Track your
                  surf journey.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="plus" useAccentColor />
                </div>
                <h3>Your Discoveries</h3>
                <p>
                  Found a new break? Add it public or private. Keep your secret
                  spots secret.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Adventures Section */}
        <section className="features features-alt">
          <div className="container">
            <div className="section-header">
              <h2>Plan Your Adventures</h2>
              <p>Find your next wave and organize group trips</p>
            </div>

            <div
              ref={planFeaturesRef as RefObject<HTMLDivElement>}
              className="features-grid flex-center"
            >
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="map" useAccentColor />
                </div>
                <h3>Explore Worldwide</h3>
                <p>
                  Search thousands of spots by location, wave type, and
                  difficulty. Filter by best seasons to time your travels
                  perfectly.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="heart" useAccentColor />
                </div>
                <h3>Watch List Alerts</h3>
                <p>
                  Get notified when swell season starts, travel deals drop, or
                  events happen at spots you're following.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="plane" useAccentColor />
                </div>
                <h3>Organize Trips</h3>
                <p>
                  Create itineraries with multiple spots, invite friends to
                  join, and document your journey with shared photos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>Getting Started is Easy</h2>
              <p>Start tracking in under a minute</p>
            </div>

            <div ref={stepsRef as RefObject<HTMLDivElement>} className="steps">
              <div className="step animate-on-scroll">
                <div className="step-number">1</div>
                <h3>Explore</h3>
                <p>
                  Browse spots worldwide—no signup required to discover new
                  locations.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">2</div>
                <h3>Track</h3>
                <p>
                  Sign up free to log sessions, rate spots, and build your
                  personal collection.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">3</div>
                <h3>Organize</h3>
                <p>
                  Create watch lists, plan group trips, and invite friends to
                  share the stoke.
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
              Join surfers worldwide mapping their sessions and planning their
              next adventure.
            </p>
            <div className="cta-buttons">
              <NavButton
                label="Start Browsing Spots"
                to="/surf-spots"
                variant="secondary"
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
