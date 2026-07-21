import { RefObject } from 'react'
import type { LinksFunction, MetaFunction } from 'react-router'

import { NavButton, Icon, Footer } from '~/components'
import { useScrollReveal } from '~/hooks'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots: Never Forget a Wave' },
    {
      name: 'description',
      content:
        'Keep your surfing history in one place: every spot you have surfed, every session, every board, and every trip.',
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
  const historyFeaturesRef = useScrollReveal()
  const planFeaturesRef = useScrollReveal()
  const stepsRef = useScrollReveal()

  return (
    <div className="landing-page">
      <main className="main-content">
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
                <p className="hero-tagline">
                  A living record of every spot you have surfed, every session,
                  every trip.
                </p>
                <div className="hero-cta">
                  <NavButton
                    label="Start Your Surf Map"
                    to="/surf-spots"
                    variant="secondary"
                    ariaLabel="Explore surf spots and start your surf map"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <div className="section-header">
              <h2>Your Surf History</h2>
              <p>
                Every surfer remembers their best waves. Few remember every
                place, every board, every session, and every trip. Surf Spots
                keeps your entire surfing story in one place.
              </p>
            </div>

            <div
              ref={historyFeaturesRef as RefObject<HTMLDivElement>}
              className="features-grid flex-center"
            >
              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="pin" useAccentColor />
                </div>
                <h3>Surf Map</h3>
                <p>
                  Mark every spot you have surfed and watch your personal map
                  grow across the globe.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="stopwatch" useAccentColor />
                </div>
                <h3>Sessions</h3>
                <p>
                  Log where you surfed, which board you rode, and what stood
                  out. Linked to your map so nothing gets lost.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="surfboard" useAccentColor />
                </div>
                <h3>Quiver</h3>
                <p>
                  Know which board worked where, and which ones earn a spot on
                  the next trip.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="plus" useAccentColor />
                </div>
                <h3>Discoveries</h3>
                <p>
                  Found a gem? Share it, or keep it between you and your mates.
                  We will keep your secret spots secret.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="features features-alt">
          <div className="container">
            <div className="section-header">
              <h2>Find Your Next Wave</h2>
              <p>
                Explore new spots, save the ones that matter, and plan real
                trips around them.
              </p>
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
                  Search thousands of spots with filters for wave type,
                  direction, skill level, and more.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="heart" useAccentColor />
                </div>
                <h3>Watch List</h3>
                <p>
                  Save spots for later and get notified about swell seasons,
                  travel deals, and events.
                </p>
              </div>

              <div className="feature-card animate-on-scroll">
                <div className="feature-icon" aria-hidden="true">
                  <Icon iconKey="plane" useAccentColor />
                </div>
                <h3>Trips</h3>
                <p>
                  Plan the spots, pack the boards, invite friends, and document
                  the journey when you get home.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <div className="container">
            <div className="section-header">
              <h2>Build It As You Surf</h2>
              <p>
                Browse freely. When you paddle out, leave a record that grows
                more valuable over time.
              </p>
            </div>

            <div ref={stepsRef as RefObject<HTMLDivElement>} className="steps">
              <div className="step animate-on-scroll">
                <div className="step-number">1</div>
                <h3>Explore</h3>
                <p>
                  Browse spots worldwide. No account needed to look around.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">2</div>
                <h3>Record</h3>
                <p>
                  Sign up free to log sessions, mark spots surfed, and grow your
                  personal map.
                </p>
              </div>

              <div className="step animate-on-scroll">
                <div className="step-number">3</div>
                <h3>Look Back</h3>
                <p>
                  Revisit trips, boards, and breaks years later. Your surfing
                  history, intact.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <h2>Ready to Never Forget a Wave?</h2>
            <p>
              Browse spots worldwide, then sign up free when you are ready to
              map the ones you have surfed.
            </p>
            <div className="cta-buttons">
              <NavButton
                label="Start Your Surf Map"
                to="/surf-spots"
                variant="secondary"
                ariaLabel="Explore surf spots to start your surf map"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer isAlternate={false} />
    </div>
  )
}
