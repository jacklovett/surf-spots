import { getCommonStyles } from '../index'

const CalendarIcon = ({ color = '#046380' }: { color?: string }) => {
  const commonIconStyles = getCommonStyles(color)

  const ringBinderWidth = Number(commonIconStyles.strokeWidth ?? 0) + 1

  return (
    <svg {...commonIconStyles}>
      {/* Calendar */}
      <rect x="1" y="8" width="40" height="32" rx="3" ry="3" stroke={color} />
      {/* Binding Rings */}
      <line
        x1="7"
        y1="3"
        x2="7"
        y2="11"
        stroke={color}
        strokeWidth={ringBinderWidth}
      />
      <line
        x1="21"
        y1="3"
        x2="21"
        y2="11"
        stroke={color}
        strokeWidth={ringBinderWidth}
      />
      <line
        x1="35"
        y1="3"
        x2="35"
        y2="11"
        stroke={color}
        strokeWidth={ringBinderWidth}
      />
      {/* 3x2 Grid */}
      {[0, 12].map((row) =>
        [0, 12, 24].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={5.5 + col}
            y={16 + row}
            width="7"
            height="7"
            fill={color}
            stroke={color}
          />
        )),
      )}
    </svg>
  )
}

export default CalendarIcon
