import { IconKey } from './index'

interface IProps {
  iconKey: IconKey
}

export const Icon = (props: IProps) => {
  const { iconKey } = props

  const commonIconStyles: React.SVGProps<SVGSVGElement> = {
    width: 24,
    height: 24,
    fill: 'none',
    stroke: '#046380',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const renderIcon = () => {
    switch (iconKey) {
      case 'plus':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        )
      case 'bin':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6L17.4 19a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 6M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        )
      case 'heart':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )
      case 'profile':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
            <circle cx="12" cy="9" r="3" />
          </svg>
        )
      case 'cog':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.43 12.98a7.8 7.8 0 0 0 0-1.96l1.79-1.39a1 1 0 0 0 .24-1.31l-1.7-2.94a1 1 0 0 0-1.25-.45l-2.11.85a8.08 8.08 0 0 0-1.69-.98L14.64 3a1 1 0 0 0-.99-.8h-3.3a1 1 0 0 0-.99.8l-.43 2.18a8.08 8.08 0 0 0-1.69.98l-2.11-.85a1 1 0 0 0-1.25.45l-1.7 2.94a1 1 0 0 0 .24 1.31l1.79 1.39a7.8 7.8 0 0 0 0 1.96l-1.79 1.39a1 1 0 0 0-.24 1.31l1.7 2.94a1 1 0 0 0 1.25.45l2.11-.85c.52.4 1.1.72 1.69.98l.43 2.18a1 1 0 0 0 .99.8h3.3a1 1 0 0 0 .99-.8l.43-2.18c.6-.26 1.17-.58 1.69-.98l2.11.85a1 1 0 0 0 1.25-.45l1.7-2.94a1 1 0 0 0-.24-1.31l-1.79-1.39z" />
          </svg>
        )
      case 'logout':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <path d="M13 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <polyline points="16 16 21 12 16 8" />
            <line x1="21" y1="12" x2="10" y2="12" />
          </svg>
        )
      case 'pin':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24">
            <path d="M12 2C8.5 2 7.5 4 7.5 6.5C7.5 9.5 12 17.5 12 17.5S16.5 9.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 9C10.8 9 9.8 8 9.8 6.8C9.8 5.6 10.8 4.6 12 4.6C13.2 4.6 14.2 5.6 14.2 6.8C14.2 8 13.2 9 12 9Z" />
            <path d="M2 21.5c1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0 1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0" />
            <path d="M2 18.5c1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0 1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0" />
          </svg>
        )
      default:
        return null
    }
  }

  return renderIcon()
}
