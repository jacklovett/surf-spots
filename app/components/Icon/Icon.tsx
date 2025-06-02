import { SVGProps } from 'react'
import { ICON_SIZE, IconKey } from './index'

interface IProps {
  iconKey: IconKey
  useAccentColor?: boolean
}

export const Icon = (props: IProps) => {
  const { iconKey, useAccentColor } = props

  const color = useAccentColor ? '#3fc1c9' : '#046380'

  const commonIconStyles: SVGProps<SVGSVGElement> = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: `0 0 ${ICON_SIZE} ${ICON_SIZE}`,
  }

  const renderIcon = () => {
    switch (iconKey) {
      case 'bin':
        return (
          <svg {...commonIconStyles}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6L17.4 19a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 6M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        )
      case 'cog':
        return (
          <svg {...commonIconStyles}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.43 12.98a7.8 7.8 0 0 0 0-1.96l1.79-1.39a1 1 0 0 0 .24-1.31l-1.7-2.94a1 1 0 0 0-1.25-.45l-2.11.85a8.08 8.08 0 0 0-1.69-.98L14.64 3a1 1 0 0 0-.99-.8h-3.3a1 1 0 0 0-.99.8l-.43 2.18a8.08 8.08 0 0 0-1.69.98l-2.11-.85a1 1 0 0 0-1.25.45l-1.7 2.94a1 1 0 0 0 .24 1.31l1.79 1.39a7.8 7.8 0 0 0 0 1.96l-1.79 1.39a1 1 0 0 0-.24 1.31l1.7 2.94a1 1 0 0 0 1.25.45l2.11-.85c.52.4 1.1.72 1.69.98l.43 2.18a1 1 0 0 0 .99.8h3.3a1 1 0 0 0 .99-.8l.43-2.18c.6-.26 1.17-.58 1.69-.98l2.11.85a1 1 0 0 0 1.25-.45l1.7-2.94a1 1 0 0 0-.24-1.31l-1.79-1.39z" />
          </svg>
        )
      case 'filters':
        return (
          <svg {...commonIconStyles}>
            <rect width="24" height="24" fill="none" />
            <line x1="2" y1="4" x2="22" y2="4" stroke="#046380" />
            <line x1="4" y1="9" x2="20" y2="9" stroke="#046380" />
            <line x1="6" y1="14" x2="18" y2="14" stroke="#046380" />
            <line x1="8" y1="19" x2="16" y2="19" stroke="#046380" />
          </svg>
        )
      case 'heart':
        return (
          <svg {...commonIconStyles}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )
      case 'info':
        return (
          <svg {...commonIconStyles}>
            {/* Outer circle */}
            <circle cx="12" cy="12" r="10" />
            {/* Question mark */}
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      case 'logout':
        return (
          <svg {...commonIconStyles}>
            <path d="M13 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <polyline points="16 16 21 12 16 8" />
            <line x1="21" y1="12" x2="10" y2="12" />
          </svg>
        )
      case 'pin':
        return (
          <svg {...commonIconStyles}>
            <path d="M12 2C8.5 2 7.5 4 7.5 6.5C7.5 9.5 12 17.5 12 17.5S16.5 9.5 16.5 6.5C16.5 4 14.5 2 12 2ZM12 9C10.8 9 9.8 8 9.8 6.8C9.8 5.6 10.8 4.6 12 4.6C13.2 4.6 14.2 5.6 14.2 6.8C14.2 8 13.2 9 12 9Z" />
            <path d="M2 21.5c1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0 1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0" />
            <path d="M2 18.5c1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0 1.5-1 3.5-1 5.2 0 1.7 1 3.7 1 5.2 0" />
          </svg>
        )
      case 'plus':
        return (
          <svg {...commonIconStyles}>
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        )
      case 'profile':
        return (
          <svg {...commonIconStyles}>
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
            <circle cx="12" cy="9" r="3" />
          </svg>
        )
      case 'surfboard':
        return (
          <svg {...commonIconStyles} viewBox="0 0 512 512">
            <path
              d="m507.606 4.393c-3.14-3.14-7.504-4.722-11.932-4.335-1.66.147-41.32 3.852-98.607 25.142-52.544 19.527-130.676 58.303-204.508 132.135-72.912 72.911-120.941 140.386-148.393 184.152-29.978 47.791-42.525 78.11-43.045 79.377-1.781 4.345-1.425 9.272.962 13.315s6.53 6.736 11.194 7.275l51.334 5.934 5.934 51.334c.539 4.664 3.231 8.807 7.275 11.194 2.341 1.382 4.978 2.083 7.626 2.083 1.927 0 3.86-.371 5.689-1.121 1.267-.52 31.586-13.067 79.377-43.045 43.766-27.452 111.241-75.481 184.151-148.393 73.833-73.832 112.608-151.964 132.135-204.508 21.29-57.287 24.995-96.947 25.142-98.607.393-4.423-1.194-8.792-4.334-11.932zm-437.524 352.234c26.581-42.269 73.086-107.476 143.689-178.079 69.636-69.636 143.206-106.315 192.662-124.823 16.8-6.287 32.02-10.955 45.042-14.415l-378.808 378.81-35.229-4.072c6.623-13.201 17.283-32.992 32.644-57.421zm85.29 85.29c-24.431 15.363-44.221 26.022-57.42 32.645l-4.072-35.229 378.809-378.809c-3.461 13.023-8.128 28.243-14.415 45.042-18.508 49.456-55.187 123.025-124.823 192.662-70.603 70.603-135.81 117.108-178.079 143.689z"
              stroke={color}
              strokeWidth="2"
              fill={color}
            />
          </svg>
        )
      case 'crosshair':
        return (
          <svg
            {...commonIconStyles}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Circle */}
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
            />
            {/* Inner Solid Circle */}
            <circle cx="12" cy="12" r="2" fill="#ffffff" />
            {/* North Line */}
            <line
              x1="12"
              y1="0"
              x2="12"
              y2="6"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* South Line */}
            <line
              x1="12"
              y1="18"
              x2="12"
              y2="24"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* West Line */}
            <line
              x1="0"
              y1="12"
              x2="6"
              y2="12"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* East Line */}
            <line
              x1="18"
              y1="12"
              x2="24"
              y2="12"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        )
      case 'about':
        return (
          <svg {...commonIconStyles}>
            {/* Outer circle */}
            <circle cx="12" cy="12" r="10" />
            {/* Question mark */}
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      default:
        return null
    }
  }

  return renderIcon()
}
