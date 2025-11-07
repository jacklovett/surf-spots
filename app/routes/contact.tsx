import type { MetaFunction } from 'react-router'
import { RefObject } from 'react'
import { Page, Button, SocialLinks } from '~/components'
import { useScrollReveal } from '~/hooks'

export const meta: MetaFunction = () => {
  return [
    { title: 'Contact Us - Surf Spots' },
    {
      name: 'description',
      content:
        'Get in touch with the Surf Spots team for support, feedback, or questions.',
    },
  ]
}

export default function Contact() {
  const infoCardsRef = useScrollReveal()

  return (
    <Page showHeader>
      <div className="contact-page">
        <h1>Contact Us</h1>
        <p>
          Have questions, feedback, or need support? We'd love to hear from you!
        </p>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          <form className="contact-form" method="post">
            <div className="form-row">
              <div className="form-item">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-item">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="How can we help?"
                required
              />
            </div>

            <div className="form-item">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us more about your question or feedback..."
                rows={6}
                required
              />
            </div>

            <div className="form-submit">
              <Button type="submit" label="Send Message" />
            </div>
          </form>
        </div>

        <div
          ref={infoCardsRef as RefObject<HTMLDivElement>}
          className="contact-info-section"
        >
          <div className="info-card animate-on-scroll">
            <h3>Get in Touch</h3>
            <p>
              Email us directly at:{' '}
              <a href="mailto:hello@surfspots.com">hello@surfspots.com</a>
            </p>
            <p>We typically respond within 24 hours.</p>
          </div>

          <div className="info-card animate-on-scroll">
            <h3>Follow Us</h3>
            <p>Stay updated with the latest news and surf spot discoveries:</p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </Page>
  )
}
