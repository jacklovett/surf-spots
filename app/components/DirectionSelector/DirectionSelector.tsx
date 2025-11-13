import { memo, useState, useEffect } from 'react'
import { Direction } from '~/types/surfSpots'
import {
  DIRECTIONS,
  describeArc,
  SVG_ANGLE_OFFSET,
} from '~/components/ConditionIcons/DirectionIcon'
import {
  CONDITION_CIRC_COORD,
  CONDITION_ICON_RADIUS,
  getCommonStyles,
} from '~/components/ConditionIcons'
import { directionArrayToString } from '~/utils/surfSpotUtils'

interface DirectionSelectorProps {
  selected: string[]
  onChange: (directions: string[]) => void
  formName?: string
}

/**
 * DirectionSelector component
 * @param selected - The selected directions
 * @param onChange - The function to call when the selected directions change
 * @param formName - The name of the form field to submit the selected directions to
 * @returns The DirectionSelector component
 */
const DirectionSelector = memo(
  ({ selected, onChange, formName }: DirectionSelectorProps) => {
    const directions: Direction[] = Object.values(Direction) as Direction[]
    const [startDirection, setStartDirection] = useState<Direction | null>(null)
    const [endDirection, setEndDirection] = useState<Direction | null>(null)

    // Initialize from selected array - convert to range format
    useEffect(() => {
      if (selected.length === 0) {
        setStartDirection(null)
        setEndDirection(null)
      } else if (selected.length === 1) {
        setStartDirection(selected[0] as Direction)
        setEndDirection(null)
      } else {
        // Use first and last as range
        setStartDirection(selected[0] as Direction)
        setEndDirection(selected[selected.length - 1] as Direction)
      }
    }, [selected])

    const handleDirectionClick = (direction: Direction) => {
      if (!startDirection || (startDirection && endDirection)) {
        // Start new selection
        setStartDirection(direction)
        setEndDirection(null)
        onChange([direction])
      } else if (startDirection && !endDirection) {
        // Complete the range
        setEndDirection(direction)
        // Generate all directions in the range for backend
        const range = getDirectionRange(startDirection, direction)
        onChange(range)
      }
    }

    const getDirectionRange = (start: Direction, end: Direction): string[] => {
      const startIdx = directions.indexOf(start)
      const endIdx = directions.indexOf(end)
      const range: string[] = []

      if (startIdx <= endIdx) {
        // Normal range (e.g., N to SE)
        for (let i = startIdx; i <= endIdx; i++) {
          range.push(directions[i])
        }
      } else {
        // Wraps around (e.g., NW to NE)
        for (let i = startIdx; i < directions.length; i++) {
          range.push(directions[i])
        }
        for (let i = 0; i <= endIdx; i++) {
          range.push(directions[i])
        }
      }

      return range
    }

    const getMaskPath = (size: number) => {
      if (!startDirection || !endDirection) return null

      // Get all directions in the range (including intermediate ones)
      const range = getDirectionRange(startDirection, endDirection)

      // Get the first and last angles from the range
      const firstAngle = DIRECTIONS[range[0] as Direction]
      const lastAngle = DIRECTIONS[range[range.length - 1] as Direction]

      // Check if original range wraps around (before SVG offset)
      const originalWrapsAround = firstAngle > lastAngle

      // Adjust angles for SVG coordinate system (same as DirectionIcon)
      // SVG_ANGLE_OFFSET is 270, which rotates the coordinate system
      let svgStartAngle = (firstAngle + SVG_ANGLE_OFFSET) % 360
      let svgEndAngle = (lastAngle + SVG_ANGLE_OFFSET) % 360

      // Handle wrap-around: if original range doesn't wrap but SVG-adjusted does,
      // we need to extend the end angle to complete the arc through all intermediate directions
      if (!originalWrapsAround && svgStartAngle > svgEndAngle) {
        // Normal range that appears to wrap after SVG offset (e.g., N to E: 270° to 0°)
        // Extend end angle to go the long way around to include all intermediate directions
        svgEndAngle += 360
      }

      // Scale coordinates for the new size (60px instead of 42px)
      const scaleFactor = size / 42
      const center = CONDITION_CIRC_COORD * scaleFactor
      const radius = CONDITION_ICON_RADIUS * scaleFactor

      // Determine if we are filling an inverted range (same logic as DirectionIcon)
      // When startAngle < endAngle after SVG offset, it means the range wraps around
      const isInvertedRange = svgStartAngle < svgEndAngle

      // Create mask path for the selected range (this will be cut out)
      // The arc should span from the first direction to the last direction
      // Use same logic as DirectionIcon: pass endAngle first, then startAngle
      // describeArc draws from endAngle to startAngle, so we need to pass them in reverse
      const maskPath = describeArc(
        center,
        center,
        radius,
        svgEndAngle,
        isInvertedRange ? svgStartAngle + 360 : svgStartAngle,
      )

      return maskPath
    }

    // Make it bigger - use 60px instead of 42px
    const size = 60
    const maskPath = getMaskPath(size)
    const commonIconStyles = {
      ...getCommonStyles('#046380', size),
      viewBox: `0 0 ${size} ${size}`, // Override viewBox to match size
    }
    const maskId = `direction-mask-${startDirection}-${endDirection}`

    // Convert selected array to string format for form submission (e.g., "N-E" or "N")
    const directionValue = directionArrayToString(selected)

    return (
      <div className="direction-selector">
        {/* Hidden input for form submission when formName is provided */}
        {formName && (
          <input type="hidden" name={formName} value={directionValue} />
        )}
        <div className="direction-selector-compass">
          <svg {...commonIconStyles} className="direction-selector-svg">
            <defs>
              {/* Mask to show only the selected range */}
              {maskPath && (
                <mask id={maskId}>
                  {/* White = visible, Black = hidden */}
                  {/* Fill everything black (hidden), then show only the selected range in white */}
                  <rect width="100%" height="100%" fill="black" />
                  <path d={maskPath} fill="white" />
                </mask>
              )}
            </defs>
            {/* Concentric circles like DirectionIcon - scaled for new size */}
            {(() => {
              const scaleFactor = size / 42
              const center = CONDITION_CIRC_COORD * scaleFactor
              return [CONDITION_ICON_RADIUS, 14.25, 9.5, 4.75].map(
                (radius, idx) => (
                  <circle
                    key={`circle-${idx}`}
                    cx={center}
                    cy={center}
                    r={radius * scaleFactor}
                  />
                ),
              )
            })()}
            {/* Full circle filled, with selected range cut out via mask */}
            {(() => {
              const scaleFactor = size / 42
              const center = CONDITION_CIRC_COORD * scaleFactor
              const radius = CONDITION_ICON_RADIUS * scaleFactor
              return maskPath ? (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="#046380"
                  mask={`url(#${maskId})`}
                />
              ) : (
                <circle cx={center} cy={center} r={radius} fill="#046380" />
              )
            })()}
          </svg>
          {/* Clickable direction points around the circle */}
          {directions.map((direction) => {
            const angle = DIRECTIONS[direction]
            const isStart = direction === startDirection
            const isEnd = direction === endDirection
            // Check if this direction is in the selected range (including intermediate ones)
            const isInRange =
              startDirection &&
              endDirection &&
              getDirectionRange(startDirection, endDirection).includes(
                direction,
              )
            const angleRad = (angle * Math.PI) / 180
            // Position buttons further out from the icon border for better spacing
            // Scale radius proportionally for larger size (60px instead of 42px)
            const scaleFactor = size / 42
            const center = CONDITION_CIRC_COORD * scaleFactor
            const radius = (CONDITION_ICON_RADIUS + 12) * scaleFactor
            const x = center + radius * Math.sin(angleRad)
            const y = center - radius * Math.cos(angleRad)

            return (
              <button
                key={direction}
                type="button"
                className={`direction-selector-button ${isStart ? 'start' : ''} ${
                  isEnd ? 'end' : ''
                } ${isInRange ? 'in-range' : ''}`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleDirectionClick(direction)}
                aria-label={`Select ${direction} direction`}
              >
                {direction}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
)

DirectionSelector.displayName = 'DirectionSelector'

export default DirectionSelector
