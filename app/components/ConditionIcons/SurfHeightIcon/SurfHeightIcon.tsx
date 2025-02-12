import { getCommonStyles } from '../index'

const SurfHeightIcon = ({ color = '#046380' }: { color?: string }) => {
  const commonIconStyles = getCommonStyles(color)

  return (
    <svg {...commonIconStyles}>
      {/* Ruler */}
      <rect
        x="2"
        y="4"
        width="7"
        height="37"
        stroke={color}
        strokeWidth={commonIconStyles.strokeWidth}
      />

      {[9, 13, 17, 21, 25, 29, 33, 37].map((y, i) => (
        <line
          key={i}
          x1="2"
          y1={y}
          x2={i % 2 === 0 ? '6' : '5'}
          y2={y}
          stroke={color}
          strokeWidth={commonIconStyles.strokeWidth} // Matches ruler lines thickness
        />
      ))}

      {/* Wave */}
      <path
        d="M30,28H24a10.0349,10.0349,0,0,1-6.9268-17.2622A11.9629,11.9629,0,0,0,12.9937,10a6.9027,6.9027,0,0,0-6.0308,3.42C4.9966,16.4348,4,21.34,4,28H2c0-7.0542,1.106-12.3274,3.2871-15.6726A8.906,8.906,0,0,1,12.9937,8h.0068a14.762,14.762,0,0,1,6.4619,1.592,1,1,0,0,1,.0869,1.7222A8.0249,8.0249,0,0,0,24,26h6Z"
        transform="scale(1.2, 1.2) translate(10, 6.5)"
        stroke={color}
        fill={color}
        strokeWidth="0.25"
      />
    </svg>
  )
}

export default SurfHeightIcon
