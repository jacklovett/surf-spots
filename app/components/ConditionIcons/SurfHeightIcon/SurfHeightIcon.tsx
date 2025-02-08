import { getCommonStyles } from '../index'

const SurfHeightIcon = ({ color = '#046380' }: { color?: string }) => {
  const commonIconStyles = getCommonStyles(color)

  return (
    <svg {...commonIconStyles}>
      {/* Ruler */}
      <rect x="2" y="4" width="7" height="37" stroke={color} strokeWidth="2" />
      {[9, 13, 17, 21, 25, 29, 33, 37].map((y, i) => (
        <line
          key={i}
          x1="2"
          y1={y}
          x2={i % 2 === 0 ? '6' : '5'}
          y2={y}
          stroke={color}
          strokeWidth="2"
        />
      ))}
      {/* Wave */}
      <path
        d="M16.6663 18.3335C4.91978 18.5719 2.08301 35.4168 2.08301 35.4168V42.0835H34.1663V35.4168C34.1663 35.4168 11.6663 40.8335 16.6663 18.3335Z"
        stroke={color}
        strokeWidth="2"
        transform="translate(12, 1)"
      />
    </svg>
  )
}

export default SurfHeightIcon
