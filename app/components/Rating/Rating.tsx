import { useState } from 'react'
import classNames from 'classnames'

interface IProps {
  value?: number
  onChange?: (value?: number) => void
  maxStars?: number
  readOnly?: boolean
}

const Rating = ({
  value,
  onChange,
  maxStars = 5,
  readOnly = false,
}: IProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const handleClick = (star: number) => !readOnly && onChange && onChange(star)
  const handleMouseEnter = (star: number) => !readOnly && setHoveredStar(star)
  const handleMouseLeave = () => !readOnly && setHoveredStar(null)

  return (
    <div className="rating">
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1
        const isFilled = hoveredStar
          ? starValue <= hoveredStar
          : value && starValue <= value

        return (
          <span
            key={starValue}
            className={classNames('star', {
              filled: isFilled,
              'read-only': readOnly,
            })}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        )
      })}
      {/* Hidden input to serialize the rating */}
      <input type="hidden" name="rating" value={value ?? ''} />
    </div>
  )
}

export default Rating
