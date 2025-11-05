import { SVGProps } from 'react'
import { ICON_SIZE, IconKey } from './index'

interface IProps {
  iconKey: IconKey
  useAccentColor?: boolean
  useBrandColors?: boolean
}

export const Icon = (props: IProps) => {
  const { iconKey, useAccentColor, useBrandColors } = props

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
      case 'ai':
        return (
          <svg {...commonIconStyles} viewBox="0 0 24 24" fill="none">
            {/* Two sparkle stars for AI - commonly used AI icon pattern */}
            {/* White stars that will be visible on the filled button background - almost filling the space */}
            <path
              d="M7 1L9 9L17 11L9 13L7 21L5 13L0 11L5 9L7 1Z"
              fill="#ffffff"
              stroke="none"
            />
            <path
              d="M18 9L19.5 14L23 16L19.5 18L18 22L16.5 18L13 16L16.5 14L18 9Z"
              fill="#ffffff"
              stroke="none"
            />
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
            <circle cx="12" cy="12" r="10" stroke={color} fill="none" />
            {/* White 'i' in the center */}
            <line
              x1="12"
              y1="9"
              x2="12"
              y2="15"
              stroke="#ffffff"
              strokeWidth={2.5}
            />
            <circle cx="12" cy="17" r="1.2" fill="#ffffff" />
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
      case 'search':
        return (
          <svg {...commonIconStyles}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
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
      case 'error':
        return (
          <svg {...commonIconStyles} width="48" height="48" viewBox="0 0 48 48">
            {/* Warning triangle */}
            <path
              d="M24 3L3 42h42L24 3z"
              strokeWidth="4"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Exclamation mark */}
            <line
              x1="24"
              y1="16"
              x2="24"
              y2="26"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="24" cy="32" r="1.5" fill={color} />
          </svg>
        )
      case 'facebook':
        return (
          <svg
            width="24"
            height="24"
            fill={useBrandColors ? '#1877F2' : 'currentColor'}
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      case 'google':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )
      case 'instagram':
        return (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      case 'twitter':
        return (
          <svg
            width="24"
            height="24"
            fill={useBrandColors ? '#1DA1F2' : color}
            viewBox="0 0 24 24"
          >
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
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
      case 'envelope':
        return (
          <svg {...commonIconStyles}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        )
      case 'map':
        return (
          <svg {...commonIconStyles}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        )
      default:
        return null
    }
  }

  return renderIcon()
}
