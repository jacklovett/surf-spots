import { KofiButton, Page } from '~/components'

export default function AboutUs() {
  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div className="content-container">
          <h1 className="mb">About Surf Spots</h1>

          <div className="column gap">
            <section>
              <h2 className="mb">The Story</h2>
              <p className="mb">
                Surf Spots was created by a passionate surfer who wanted a way
                to keep track of the spots he has exlored around the world.
                Where I have surfed, which countries and continents etc. I
                thought maybe there were like minded surfers out there, so as a
                solo developer, I built this platform to make it easier for
                everyone to discover and enjoy surfing.
              </p>
            </section>

            <section>
              <h2 className="mb">Support the Project</h2>
              <p className="mb">
                If you find Surf Spots helpful, consider supporting the project!
                Your support helps keep the platform running and allows me to
                add more features and improvements.
              </p>
              <div className="center-horizontal pt">
                <KofiButton />
              </div>
            </section>

            <section>
              <h2 className="mb">Affiliate Links</h2>
              <p>
                Some links to surf gear and related products on this site are
                affiliate links. This means if you make a purchase through these
                links, I receive a small commission at no extra cost to you.
                This helps support the development and maintenance of Surf
                Spots.
              </p>
            </section>

            <section>
              <h2 className="mb">Direct Advertisement</h2>
              <p>
                If you are a surf or ocean related business that would like to
                advertise on the platform then reach out at:{' '}
                <a href="mailto:info@surfspots.com">info@surfspots.com</a>. Be
                it, surf camps, surf schools, local surf shops or ocean/beach
                related charities. We will not just advertise anything on the
                platform, it must be inline with our values.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Page>
  )
}
