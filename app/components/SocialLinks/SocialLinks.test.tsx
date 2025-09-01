import { render, screen } from '@testing-library/react'
import { SocialLinks } from './SocialLinks'

describe('SocialLinks', () => {
  it('renders all social media links', () => {
    render(<SocialLinks />)

    // Check if all social media links are present
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<SocialLinks className="custom-class" />)

    const socialLinks = screen.getByRole('link', {
      name: /instagram/i,
    }).parentElement
    expect(socialLinks).toHaveClass('social-links', 'custom-class')
  })

  it('opens links in new tab with proper security attributes', () => {
    render(<SocialLinks />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
