import { KofiButton, Page } from '~/components'

export default function AboutUs() {
  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <h1>About Surf Spots</h1>

        <h2>The Story</h2>
        <p>
          I created Surf Spots as a passionate surfer who wanted a way to
          keep track of the spots I have explored around the world—where I
          have surfed, which countries and continents, and so on. I thought
          there might be like-minded surfers out there, so as a solo
          developer I built this platform to make it easier for everyone to
          discover and enjoy surfing.
        </p>

        <h2>Support the Project</h2>
        <p>
          If you find Surf Spots helpful, consider supporting the project!
          Your support helps keep the platform running and allows me to add
          more features and improvements.
        </p>
        <div className="center-horizontal pt">
          <KofiButton />
        </div>

        <h2>Affiliate Links</h2>
        <p>
          Some links to surf gear and related products on this site are
          affiliate links. This means if you make a purchase through these
          links, I receive a small commission at no extra cost to you. This
          helps support the development and maintenance of Surf Spots.
        </p>

        <h2>Direct Advertisement</h2>
        <p>
          If you are a surf or ocean related business that would like to
          advertise on the platform then reach out at:{' '}
          <a href="mailto:info@surfspots.io">info@surfspots.io</a>. Be it,
          surf camps, surf schools, local surf shops or ocean/beach related
          charities. We will not just advertise anything on the platform, it
          must be inline with our values.
        </p>
      </div>
    </Page>
  )
}
