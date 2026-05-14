import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import { flushSync } from 'react-dom'

import Icon from '../Icon'
import { useClickOutside } from '~/hooks'
import {
  formatTimeDigitMask,
  formatTimeForDisplay,
  hhMmStringFromFourDigits,
  parseLocalTimeToMinutes,
  pickerListHourMinuteFromDigits,
  stepBackTimeDigitBuffer,
  takeTimeDigits,
  TIME_DIGIT_BUFFER_LEN,
  timeOrInvalidToFourDigitBuffer,
  timeToHHmm,
} from '~/utils/dateUtils'
import { HOUR_VALUES, MINUTE_VALUES } from './index'

/**
 * Masked 24h time: fixed digit stack (HHMM), committed HH:mm derived only from that stack
 * (same invariant as integer-minor-units currency inputs). The colon is display-only.
 * Users may clear and enter digits freely; the stored digit string never exceeds four digits
 * (`takeTimeDigits` / TIME_DIGIT_BUFFER_LEN).
 */

/** Matches native `<input type="time">` empty mask (locale-independent). */
const TIME_EMPTY_PLACEHOLDER = '--:--'

const scrollColumnToChild = (
  column: HTMLElement | null,
  child: HTMLElement | null,
) => {
  if (!column || !child) return
  const nextTop =
    child.offsetTop - column.clientHeight / 2 + child.offsetHeight / 2
  const maxScroll = Math.max(0, column.scrollHeight - column.clientHeight)
  column.scrollTop = Math.max(0, Math.min(nextTop, maxScroll))
}

interface TimeInputProps {
  label: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  showLabel?: boolean
  disabled?: boolean
}

export const TimeInput = (props: TimeInputProps) => {
  const { label, name, value, onChange, showLabel, disabled } = props
  const reactId = useId()
  const labelId = `${name}-label-${reactId}`
  const inputId = `${name}-input-${reactId}`
  const panelId = `${name}-panel-${reactId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hourColumnRef = useRef<HTMLDivElement>(null)
  const minuteColumnRef = useRef<HTMLDivElement>(null)
  const hourSelectedRef = useRef<HTMLButtonElement | null>(null)
  const minuteSelectedRef = useRef<HTMLButtonElement | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isTextFocused, setIsTextFocused] = useState(false)
  /** HHMM digit stack while the text field is focused; authoritative over displayed punctuation. */
  const [digitBuffer, setDigitBuffer] = useState('')
  /** Snapshot of `value` when the text field gained focus (Escape restores). */
  const valueCommittedOnFocusRef = useRef<string>(value)

  const valueMinutes = useMemo(() => parseLocalTimeToMinutes(value), [value])

  const [draftHour, setDraftHour] = useState(12)
  const [draftMinute, setDraftMinute] = useState(0)

  useEffect(() => {
    if (isTextFocused && digitBuffer.length > 0) {
      const { hour, minute } = pickerListHourMinuteFromDigits(digitBuffer)
      setDraftHour(hour)
      setDraftMinute(minute)
      return
    }
 
    if (valueMinutes != null) {
      setDraftHour(Math.floor(valueMinutes / 60))
      setDraftMinute(valueMinutes % 60)
      return
    }

    setDraftHour(12)
    setDraftMinute(0)
  }, [isTextFocused, digitBuffer, valueMinutes])

  const closePanel = useCallback(() => setIsOpen(false), [])

  useClickOutside(containerRef, closePanel, isOpen)

  const commitStringValue = useCallback(
    (next: string) => {
      const syntheticEvent = {
        target: { name, value: next },
        currentTarget: { name, value: next },
      } as ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    },
    [name, onChange],
  )

  const commitTime = useCallback(
    (hour: number, minute: number) => {
      const hourDigits = String(hour).padStart(2, '0')
      const minuteDigits = String(minute).padStart(2, '0')
      commitStringValue(`${hourDigits}:${minuteDigits}`)
    },
    [commitStringValue],
  )

  const applyDigitBuffer = useCallback(
    (raw: string) => {
      const digits = takeTimeDigits(raw)
      setDigitBuffer(digits)
      if (digits.length === TIME_DIGIT_BUFFER_LEN) {
        commitStringValue(hhMmStringFromFourDigits(digits))
      } else {
        commitStringValue('')
      }
    },
    [commitStringValue],
  )

  const syncDigitBufferFromPicker = useCallback(
    (hour: number, minute: number) => {
      if (!isTextFocused) return
      setDigitBuffer(
        `${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`,
      )
    },
    [isTextFocused],
  )

  useEffect(() => {
    if (!isOpen) return
    const animationFrameId = requestAnimationFrame(() => {
      scrollColumnToChild(hourColumnRef.current, hourSelectedRef.current)
      scrollColumnToChild(minuteColumnRef.current, minuteSelectedRef.current)
    })
    return () => cancelAnimationFrame(animationFrameId)
  }, [isOpen, draftHour, draftMinute])

  useEffect(() => {
    if (!isOpen) return
    const onDocKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [isOpen])

  const handleTextFocus = () => {
    valueCommittedOnFocusRef.current = value
    setIsTextFocused(true)
    setDigitBuffer(value.trim() ? timeOrInvalidToFourDigitBuffer(value) : '')
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const handleTextBlur = (event: FocusEvent<HTMLInputElement>) => {
    const relatedTarget = event.relatedTarget
    if (
      relatedTarget instanceof Node &&
      containerRef.current?.contains(relatedTarget)
    ) {
      return
    }

    setIsTextFocused(false)

    if (digitBuffer.length === 0) {
      if (value !== '') {
        commitStringValue('')
      }
      return
    }

    if (digitBuffer.length < TIME_DIGIT_BUFFER_LEN) {
      setDigitBuffer(value.trim() ? timeOrInvalidToFourDigitBuffer(value) : '')
      return
    }
  }

  const handleTextKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      const restore = valueCommittedOnFocusRef.current.trim()
      // Flush the state update to the DOM to avoid a flash of the old value
      flushSync(() => {
        setDigitBuffer(restore ? timeOrInvalidToFourDigitBuffer(restore) : '')
        
        if (!restore) {
          commitStringValue('')
          return
        }

        commitStringValue(
          parseLocalTimeToMinutes(restore) != null ? timeToHHmm(restore) : restore,
        )
      })
      event.currentTarget.blur()
      return
    }

    if (disabled) return

    const textInput = event.currentTarget
    const start = textInput.selectionStart ?? 0
    const end = textInput.selectionEnd ?? 0
    const masked = formatTimeDigitMask(digitBuffer)

    if (event.key === 'Backspace') {
      event.preventDefault()
      const rawForApply =
        start !== end
          ? masked.slice(0, start) + masked.slice(end)
          : stepBackTimeDigitBuffer(digitBuffer)
      applyDigitBuffer(rawForApply)
      const nextDigits = takeTimeDigits(rawForApply)
      requestAnimationFrame(() => {
        const tail = formatTimeDigitMask(nextDigits).length
        textInput.setSelectionRange(tail, tail)
      })
      return
    }

    const pressedKey = event.key
    const isDigit = pressedKey.length === 1 && pressedKey >= '0' && pressedKey <= '9'
    if (!isDigit || event.ctrlKey || event.metaKey || event.altKey) return

    if (start !== end) return

    if (digitBuffer.length >= TIME_DIGIT_BUFFER_LEN) {
      const setCaretToEndOf = (rawForDigits: string) => {
        const caretDigits = takeTimeDigits(rawForDigits)
        requestAnimationFrame(() => {
          const tail = formatTimeDigitMask(caretDigits).length
          textInput.setSelectionRange(tail, tail)
        })
      }

      if (digitBuffer === '0000') {
        event.preventDefault()
        applyDigitBuffer(pressedKey)
        setCaretToEndOf(pressedKey)
        return
      }

      const minutePair = digitBuffer.slice(2, 4)
      if (minutePair === '00') {
        event.preventDefault()
        const nextRaw =
          pressedKey === '0'
            ? digitBuffer.slice(0, 3)
            : `${digitBuffer.slice(0, 2)}${pressedKey}0`
        applyDigitBuffer(nextRaw)
        setCaretToEndOf(nextRaw)
        return
      }

      if (digitBuffer[3] === '0' && minutePair !== '00') {
        event.preventDefault()
        const nextRaw = digitBuffer.slice(0, 3) + pressedKey
        applyDigitBuffer(nextRaw)
        setCaretToEndOf(nextRaw)
        return
      }

      event.preventDefault()
    }
  }

  const handleHourPick = (hour: number) => {
    commitTime(hour, draftMinute)
    syncDigitBufferFromPicker(hour, draftMinute)
  }

  const handleMinutePick = (minute: number) => {
    commitTime(draftHour, minute)
    syncDigitBufferFromPicker(draftHour, minute)
  }

  const handleColumnKeyDown = useCallback(
    (column: 'hour' | 'minute', event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (column === 'hour') {
          const nextHour = Math.min(23, draftHour + 1)
          commitTime(nextHour, draftMinute)
          syncDigitBufferFromPicker(nextHour, draftMinute)
        } else {
          const nextMinute = Math.min(59, draftMinute + 1)
          commitTime(draftHour, nextMinute)
          syncDigitBufferFromPicker(draftHour, nextMinute)
        }
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (column === 'hour') {
          const nextHour = Math.max(0, draftHour - 1)
          commitTime(nextHour, draftMinute)
          syncDigitBufferFromPicker(nextHour, draftMinute)
        } else {
          const nextMinute = Math.max(0, draftMinute - 1)
          commitTime(draftHour, nextMinute)
          syncDigitBufferFromPicker(draftHour, nextMinute)
        }
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        if (column === 'hour') {
          commitTime(0, draftMinute)
          syncDigitBufferFromPicker(0, draftMinute)
        } else {
          commitTime(draftHour, 0)
          syncDigitBufferFromPicker(draftHour, 0)
        }
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        if (column === 'hour') {
          commitTime(23, draftMinute)
          syncDigitBufferFromPicker(23, draftMinute)
        } else {
          commitTime(draftHour, 59)
          syncDigitBufferFromPicker(draftHour, 59)
        }
      }
    },
    [commitTime, draftHour, draftMinute, syncDigitBufferFromPicker],
  )

  const displayForField = isTextFocused
    ? formatTimeDigitMask(digitBuffer)
    : value.trim()
      ? formatTimeForDisplay(value)
      : ''

  return (
    <div
      ref={containerRef}
      className={classNames('form-item', 'time-input-wrapper', {
        'time-input-wrapper-open': isOpen,
      })}
    >
      <label
        id={labelId}
        className={showLabel ? 'visible' : ''}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="time-input-container">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayForField}
          placeholder={TIME_EMPTY_PLACEHOLDER}
          onChange={(event) => {
            if (disabled) return
            applyDigitBuffer(event.target.value)
          }}
          onFocus={handleTextFocus}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls={isOpen ? panelId : undefined}
          className="time-input"
        />
        <span
          className="time-input-clock"
          aria-hidden
          onMouseDown={(mouseEvent) => {
            if (disabled) return
            mouseEvent.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <Icon iconKey="clock" size={18} />
        </span>
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={disabled}
          aria-hidden
          tabIndex={-1}
        />
      </div>
      {isOpen && (
        <div
          id={panelId}
          className="time-picker-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          onMouseDown={(mouseEvent) => mouseEvent.preventDefault()}
        >
          <div className="time-picker-panel-header">
            <span className="time-picker-column-label bold text-secondary font-small">
              Hour
            </span>
            <span className="time-picker-column-label bold text-secondary font-small">
              Minute
            </span>
          </div>
          <div className="time-picker-columns">
            <div
              ref={hourColumnRef}
              className="time-picker-column"
              role="listbox"
              aria-label="Hour"
              aria-activedescendant={`${panelId}-hour-${draftHour}`}
              tabIndex={0}
              onKeyDown={(event) => handleColumnKeyDown('hour', event)}
            >
              {HOUR_VALUES.map((hour) => (
                <button
                  key={hour}
                  id={`${panelId}-hour-${hour}`}
                  ref={hour === draftHour ? hourSelectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={hour === draftHour}
                  className={classNames('time-picker-option', {
                    selected: hour === draftHour,
                  })}
                  tabIndex={-1}
                  onClick={() => handleHourPick(hour)}
                >
                  {String(hour).padStart(2, '0')}
                </button>
              ))}
            </div>
            <div
              ref={minuteColumnRef}
              className="time-picker-column"
              role="listbox"
              aria-label="Minute"
              aria-activedescendant={`${panelId}-minute-${draftMinute}`}
              tabIndex={0}
              onKeyDown={(event) => handleColumnKeyDown('minute', event)}
            >
              {MINUTE_VALUES.map((minuteValue) => (
                <button
                  key={minuteValue}
                  id={`${panelId}-minute-${minuteValue}`}
                  ref={minuteValue === draftMinute ? minuteSelectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={minuteValue === draftMinute}
                  className={classNames('time-picker-option', {
                    selected: minuteValue === draftMinute,
                  })}
                  tabIndex={-1}
                  onClick={() => handleMinutePick(minuteValue)}
                >
                  {String(minuteValue).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeInput
