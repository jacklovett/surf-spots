import { useState } from 'react'
import classNames from 'classnames'

interface RatingProps {
  value?: number | null
  onChange?: (value?: number) => void
  maxStars?: number
  readOnly?: boolean
  /** When set, renders a hidden input for form submission (interactive mode only). */
  inputName?: string
  /** Smaller stars for compact list rows. */
  size?: 'default' | 'compact'
}

const Rating = ({
  value,
  onChange,
  maxStars = 5,
  readOnly = false,
  inputName,
  size = 'default',
}: RatingProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const numericValue = value ?? undefined

  const handleClick = (star: number) => {
    if (!readOnly && onChange) {
      onChange(star)
    }
  }

  const handleMouseEnter = (star: number) => {
    if (!readOnly) {
      setHoveredStar(star)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredStar(null)
    }
  }

  return (
    <div
      className={classNames('rating', {
        'rating-compact': size === 'compact',
        'rating-read-only': readOnly,
      })}
      aria-label={
        numericValue != null
          ? `Rating ${numericValue} out of ${maxStars}`
          : 'No rating'
      }
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1
        const isFilled = hoveredStar
          ? starValue <= hoveredStar
          : numericValue != null && starValue <= numericValue

        return (
          <span
            key={starValue}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? undefined : 0}
            aria-hidden={readOnly ? true : undefined}
            className={classNames('star', {
              filled: isFilled,
              'read-only': readOnly,
            })}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(event) => {
              if (readOnly) {
                return
              }
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick(starValue)
              }
            }}
            aria-label={
              readOnly ? undefined : `Rate ${starValue} out of ${maxStars}`
            }
          >
            ★
          </span>
        )
      })}
      {!readOnly && inputName && (
        <input type="hidden" name={inputName} value={numericValue ?? ''} />
      )}
    </div>
  )
}

export default Rating
