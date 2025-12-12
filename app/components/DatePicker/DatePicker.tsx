import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
  FocusEvent,
} from 'react'
import classNames from 'classnames'
import { CalendarIcon } from '../ConditionIcons'
import { useClickOutside } from '~/hooks'
import { formatDateForInput, getDaysInMonth, getFirstDayOfMonth } from './index'
import { monthNames, dayNames } from '~/types/formData/surfSpots'

interface DatePickerProps {
  label: string
  name: string
  value?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  errorMessage?: string
  showLabel?: boolean
  disabled?: boolean
  min?: string
  max?: string
  showRangePreview?: boolean // Only show range preview on end date picker
}

export const DatePicker = (props: DatePickerProps) => {
  const {
    label,
    name,
    value,
    onChange,
    onBlur,
    errorMessage,
    showLabel,
    disabled,
    min,
    max,
    showRangePreview = false,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null,
  )
  // Initialize currentMonth: prefer selectedDate, then min date, then current date
  const getInitialMonth = useCallback(() => {
    if (selectedDate) return selectedDate
    if (min) return new Date(min)
    return new Date()
  }, [selectedDate, min])
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth())
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    containerRef,
    useCallback(() => setIsOpen(false), []),
    isOpen,
  )

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    } else {
      // Clear selected date if value is cleared
      setSelectedDate(null)
      // If min is set, navigate to min date when opening (but don't set selectedDate)
      if (min) {
        setCurrentMonth(new Date(min))
      }
    }
  }, [value, min])

  // When opening the picker, navigate to the appropriate month
  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setCurrentMonth(selectedDate)
      } else if (min) {
        setCurrentMonth(new Date(min))
      }
    }
  }, [isOpen, selectedDate, min])

  const handleDateSelect = useCallback(
    (day: number) => {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      )
      setSelectedDate(newDate)
      setIsOpen(false)

      const syntheticEvent = {
        target: {
          name,
          value: formatDateForInput(newDate),
        },
      } as ChangeEvent<HTMLInputElement>

      onChange(syntheticEvent)
    },
    [currentMonth, name, onChange],
  )

  const handlePrevYear = useCallback(() => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1),
    )
  }, [currentMonth])

  const handleNextYear = useCallback(() => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1),
    )
  }, [currentMonth])

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    )
  }, [currentMonth])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    )
  }, [currentMonth])

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth],
  )
  const firstDay = useMemo(
    () => getFirstDayOfMonth(currentMonth),
    [currentMonth],
  )

  const days = useMemo(() => {
    const result: (number | null)[] = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      result.push(null)
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day)
    }
    return result
  }, [firstDay, daysInMonth])

  const isDateSelected = useCallback(
    (day: number) => {
      if (!selectedDate) return false
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      )
    },
    [selectedDate, currentMonth],
  )

  const isDateDisabled = useCallback(
    (day: number) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      )
      const dateStr = formatDateForInput(date)

      if (min && dateStr < min) return true
      if (max && dateStr > max) return true
      return false
    },
    [currentMonth, min, max],
  )

  const isMinDate = useCallback(
    (day: number) => {
      if (!min) return false
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      )
      const dateStr = formatDateForInput(date)
      return dateStr === min
    },
    [currentMonth, min],
  )

  const isDateInRange = useCallback(
    (day: number) => {
      // Only show range preview when explicitly enabled (end date picker)
      // AND when we're hovering (to show preview)
      // AND min exists (start date is set)
      if (!showRangePreview || !min || !hoveredDate) return false

      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      )
      const dateStr = formatDateForInput(date)

      // Use hovered date for preview
      const endDate = formatDateForInput(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          hoveredDate,
        ),
      )

      // Only show range if current day is between min and hovered date
      return dateStr > min && dateStr < endDate
    },
    [currentMonth, min, hoveredDate, showRangePreview],
  )

  const displayValue = selectedDate
    ? formatDateForInput(selectedDate)
    : value || ''

  return (
    <div
      ref={containerRef}
      className={classNames({
        'form-item': true,
        'date-picker-wrapper': true,
        error: !!errorMessage,
      })}
    >
      <label className={showLabel ? 'visible' : ''}>{label}</label>
      <div className="date-input-container">
        <input
          type="text"
          name={name}
          value={displayValue}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={onBlur}
          placeholder={label}
          disabled={disabled}
          aria-disabled={disabled}
          className="date-input"
        />
        <button
          type="button"
          className="date-picker-toggle"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label="Open date picker"
        >
          <CalendarIcon size={20} />
        </button>
      </div>
      {isOpen && (
        <div className="date-picker-calendar">
          <div className="date-picker-header">
            <div className="date-picker-nav-group">
              <button
                type="button"
                className="date-picker-nav"
                onClick={handlePrevYear}
                aria-label="Previous year"
              >
                «
              </button>
              <button
                type="button"
                className="date-picker-nav"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                ‹
              </button>
            </div>
            <div className="date-picker-month-year bold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <div className="date-picker-nav-group">
              <button
                type="button"
                className="date-picker-nav"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                ›
              </button>
              <button
                type="button"
                className="date-picker-nav"
                onClick={handleNextYear}
                aria-label="Next year"
              >
                »
              </button>
            </div>
          </div>
          <div className="date-picker-weekdays">
            {dayNames.map((day) => (
              <div key={day} className="date-picker-weekday bold">
                {day}
              </div>
            ))}
          </div>
          <div className="date-picker-days">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="date-picker-day empty"
                  />
                )
              }

              const disabled = isDateDisabled(day)
              const selected = isDateSelected(day)
              // Only show start-date and in-range styling on end date picker
              // On start date picker, NO range preview - only individual date hover
              const isStartDate =
                showRangePreview && min ? isMinDate(day) : false
              const inRange = isDateInRange(day)

              return (
                <button
                  key={day}
                  type="button"
                  className={classNames('date-picker-day', {
                    selected,
                    disabled,
                    'start-date': isStartDate,
                    'in-range': inRange,
                  })}
                  onClick={() => !disabled && handleDateSelect(day)}
                  onMouseEnter={() => !disabled && setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={disabled}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  )
}

export default DatePicker
