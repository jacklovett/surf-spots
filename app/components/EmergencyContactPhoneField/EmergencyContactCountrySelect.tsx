import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { ElementType, FocusEvent } from 'react'
import { getCountryCallingCode } from 'libphonenumber-js'
import type { Country } from 'react-phone-number-input'
import classNames from 'classnames'

export interface CountrySelectOption {
  value?: string
  label: string
  divider?: boolean
}

interface IconComponentProps {
  country?: string
  label: string
  aspectRatio?: number
}

interface EmergencyContactCountrySelectProps {
  name?: string
  'aria-label'?: string
  value?: Country
  onChange: (country?: Country) => void
  onFocus?: () => void
  onBlur?: () => void
  options: CountrySelectOption[]
  disabled?: boolean
  readOnly?: boolean
  iconComponent: ElementType<IconComponentProps>
}

const safeCallingCode = (code: string | undefined): string => {
  if (!code || code === 'ZZ') {
    return ''
  }
  try {
    return getCountryCallingCode(code as Country)
  } catch {
    return ''
  }
}

const selectedDialLabel = (dial: string): string =>
  dial ? `+${dial}` : ''

const optionDialLabel = (dial: string): string =>
  dial ? `(+${dial})` : ''

export const EmergencyContactCountrySelect = ({
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  disabled,
  readOnly,
  iconComponent: Icon,
  'aria-label': ariaLabel,
}: EmergencyContactCountrySelectProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selectedOption = options.find((o) => !o.divider && o.value === value)
  const selectedName = selectedOption?.label ?? ''
  const selectedDial = value ? safeCallingCode(value) : ''

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, close])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null
    if (next && rootRef.current?.contains(next)) {
      return
    }
    onBlur?.()
  }

  const blocked = Boolean(disabled || readOnly)

  return (
    <div
      ref={rootRef}
      className="PhoneInputCountry emergency-contact-country-select"
      onBlur={handleContainerBlur}
      data-testid="emergency-contact-country-select"
    >
      <button
        type="button"
        data-testid="emergency-contact-country-trigger"
        className={classNames('emergency-contact-country-select-trigger', {
          'emergency-contact-country-select-trigger-open': open,
        })}
        disabled={blocked}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onFocus={() => onFocus?.()}
        onClick={() => {
          if (!blocked) {
            setOpen((o) => !o)
          }
        }}
      >
        <span className="emergency-contact-country-select-trigger-main">
          {value && (
            <span className="emergency-contact-country-select-trigger-flag">
              <Icon country={value} label={selectedName} />
            </span>
          )}
          {value && (
            <span className="emergency-contact-country-select-trigger-label">
              {selectedDialLabel(selectedDial)}
            </span>
          )}
        </span>
        <span className="PhoneInputCountrySelectArrow" aria-hidden />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          tabIndex={-1}
          className="emergency-contact-country-select-list"
          data-testid="emergency-contact-country-list"
        >
          {options.map((opt, index) => {
            if (opt.divider) {
              return (
                <li
                  key={`divider-${index}`}
                  className="emergency-contact-country-select-divider"
                  aria-hidden
                />
              )
            }

            const code = opt.value as Country | undefined
            if (!code) {
              return (
                <li key={`intl-${index}`} className="emergency-contact-country-select-row">
                  <button
                    type="button"
                    className="emergency-contact-country-select-option"
                    onMouseDown={(e) => 
                      e.preventDefault()
                    }
                    onClick={() => {
                      onChange(undefined)
                      close()
                    }}
                  >
                    <span className="emergency-contact-country-select-option-flag">
                      <Icon label={opt.label} />
                    </span>
                    <span className="emergency-contact-country-select-option-label">
                      {opt.label}
                    </span>
                  </button>
                </li>
              )
            }

            const dial = safeCallingCode(code)

            return (
              <li
                key={code}
                role="presentation"
                className="emergency-contact-country-select-row"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={value === code}
                  className={classNames('emergency-contact-country-select-option', {
                    'emergency-contact-country-select-option-selected':
                      value === code,
                  })}
                  onMouseDown={(e) => 
                    e.preventDefault()
                  }
                  onClick={() => {
                    onChange(code)
                    close()
                  }}
                >
                  <span className="emergency-contact-country-select-option-flag">
                    <Icon country={code} label={opt.label} />
                  </span>
                  <span className="emergency-contact-country-select-option-label">
                    <span className="emergency-contact-country-select-option-country">
                      {opt.label}
                    </span>
                    {dial && (
                      <span className="emergency-contact-country-select-option-dial">
                        {optionDialLabel(dial)}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
