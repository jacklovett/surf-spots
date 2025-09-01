import { Icon } from '~/components'

interface SocialLinksProps {
  className?: string
}

export const SocialLinks = ({ className }: SocialLinksProps) => (
  <div className={`social-links ${className || ''}`}>
    <a
      href="https://instagram.com/surfspots"
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
    >
      <Icon iconKey="instagram" />
    </a>
    <a
      href="https://twitter.com/surfspots"
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
    >
      <Icon iconKey="twitter" />
    </a>
    <a
      href="https://facebook.com/surfspots"
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
    >
      <Icon iconKey="facebook" />
    </a>
  </div>
)
