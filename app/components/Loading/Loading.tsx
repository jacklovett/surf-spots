import { useEffect, useState } from 'react'
import {
  CONDITION_CIRC_COORD,
  CONDITION_ICON_RADIUS,
  CONDITION_ICON_SIZE,
  getCommonStyles,
} from '../ConditionIcons'

const TOTAL_WAVES = 5
const WAVE_SPACING = Math.floor(CONDITION_ICON_SIZE / (TOTAL_WAVES + 1))
const ANIMATION_DURATION = 1800 // 1.8 seconds for full cycle
const WAVE_DELAY = ANIMATION_DURATION / TOTAL_WAVES // Time between each wave appearing

export const Loading = () => {
  const [visibleWaves, setVisibleWaves] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleWaves((prev) => {
        // If we have all waves, reset to empty
        if (prev.length >= TOTAL_WAVES) {
          return []
        }
        // Add the next wave
        return [...prev, prev.length]
      })
    }, WAVE_DELAY)

    return () => clearInterval(interval)
  }, [])

  const generateWaves = () => {
    return visibleWaves.map((waveIndex) => (
      <path
        key={waveIndex}
        d={`M0 ${
          CONDITION_ICON_SIZE - WAVE_SPACING - waveIndex * WAVE_SPACING
        }c2-2 5-2 7 0s5 2 7 0 5-2 7 0 5 2 7 0 5-2 7 0 5 2 7 0`}
        stroke="#046380"
        strokeWidth="2"
        className="wave-line"
        style={{
          animationDelay: `${waveIndex * 0.1}s`,
        }}
      />
    ))
  }

  const commonIconStyles = getCommonStyles('#046380')

  return (
    <div className="loading-container">
      <div className="animated-tide-loader">
        <svg {...commonIconStyles}>
          <defs>
            <clipPath id="clip-circle-loader">
              <circle
                cx={CONDITION_CIRC_COORD}
                cy={CONDITION_CIRC_COORD}
                r={CONDITION_ICON_RADIUS}
              />
            </clipPath>
          </defs>
          <circle
            cx={CONDITION_CIRC_COORD}
            cy={CONDITION_CIRC_COORD}
            r={CONDITION_ICON_RADIUS}
            stroke="#046380"
            strokeWidth={commonIconStyles.strokeWidth}
            fill="none"
          />
          <g clipPath="url(#clip-circle-loader)">{generateWaves()}</g>
        </svg>
      </div>
    </div>
  )
}
