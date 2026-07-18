import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { ElementType, FocusEvent, KeyboardEvent } from 'react'
import type { Country } from 'react-phone-number-input'
import classNames from 'classnames'

import {
  filterCountrySelectOptions,
  safeCallingCode,
} from './countrySelectSearch'

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

const selectedDialLabel = (dial: string): string =>
  dial ? `+${dial}` : ''

const optionDialLabel = (dial: string): string =>
  dial ? `(+${dial})` : ''

const isSelectableOption = (
  option: CountrySelectOption,
): option is CountrySelectOption & { divider?: false } => !option.divider

/** Sentinel: resolve to last option after open (Strict Mode safe). */
const ACTIVE_INDEX_LAST = -2

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
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const selectableCountRef = useRef(0)
  const listId = useId()
  const searchId = useId()

  const selectedOption = options.find(
    (option) => !option.divider && option.value === value,
  )
  const selectedName = selectedOption?.label ?? ''
  const selectedDial = value ? safeCallingCode(value) : ''
  const visibleOptions = filterCountrySelectOptions(options, query)
  const selectableOptions = visibleOptions.filter(isSelectableOption)
  selectableCountRef.current = selectableOptions.length
  const blocked = Boolean(disabled || readOnly)

  const optionDomId = (selectableOptionIndex: number): string => {
    const option = selectableOptions[selectableOptionIndex]
    if (!option) {
      return ''
    }
    return `${listId}-option-${option.value ?? `intl-${selectableOptionIndex}`}`
  }

  const activeOptionId =
    activeIndex >= 0 ? optionDomId(activeIndex) : undefined

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus()
      })
    }
  }, [])

  const selectOption = useCallback(
    (option: CountrySelectOption) => {
      const code = option.value as Country | undefined
      onChange(code)
      close(true)
    },
    [onChange, close],
  )

  const moveActiveIndex = useCallback(
    (delta: number) => {
      if (selectableOptions.length === 0) {
        return
      }
      setActiveIndex((currentIndex) => {
        if (currentIndex < 0) {
          return delta > 0 ? 0 : selectableOptions.length - 1
        }
        const nextIndex = currentIndex + delta
        if (nextIndex < 0) {
          return selectableOptions.length - 1
        }
        if (nextIndex >= selectableOptions.length) {
          return 0
        }
        return nextIndex
      })
    },
    [selectableOptions.length],
  )

  useEffect(() => {
    if (!open) {
      return
    }
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, close])

  useEffect(() => {
    if (!open) {
      return
    }
    searchInputRef.current?.focus()
    setActiveIndex((currentIndex) => {
      if (currentIndex !== ACTIVE_INDEX_LAST) {
        return currentIndex
      }
      const lastIndex = selectableCountRef.current - 1
      return lastIndex >= 0 ? lastIndex : -1
    })
  }, [open])

  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  useEffect(() => {
    if (!open || !activeOptionId) {
      return
    }
    document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' })
  }, [open, activeOptionId])

  const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (next && rootRef.current?.contains(next)) {
      return
    }
    onBlur?.()
    if (open) {
      close(false)
    }
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        moveActiveIndex(1)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        moveActiveIndex(-1)
        return
      }
      case 'Enter': {
        if (activeIndex < 0) {
          return
        }
        const activeOption = selectableOptions[activeIndex]
        if (!activeOption) {
          return
        }
        event.preventDefault()
        selectOption(activeOption)
        return
      }
      case 'Escape': {
        event.preventDefault()
        close(true)
        return
      }
      case 'Tab': {
        close(false)
        return
      }
      default:
        return
    }
  }

  let selectableRenderIndex = -1

  return (
    <div
      ref={rootRef}
      className="PhoneInputCountry emergency-contact-country-select"
      onBlur={handleContainerBlur}
      data-testid="emergency-contact-country-select"
    >
      <button
        ref={triggerRef}
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
          if (blocked) {
            return
          }
          if (open) {
            close(true)
            return
          }
          setQuery('')
          setActiveIndex(-1)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (blocked || open) {
            return
          }
          // APG: ArrowDown / ArrowUp on closed control opens the list.
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setQuery('')
            setActiveIndex(
              event.key === 'ArrowDown' ? 0 : ACTIVE_INDEX_LAST,
            )
            setOpen(true)
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
        <div className="emergency-contact-country-select-dropdown">
          <label className="sr-only" htmlFor={searchId}>
            Search country or code
          </label>
          <input
            ref={searchInputRef}
            id={searchId}
            type="text"
            role="combobox"
            className="emergency-contact-country-select-search"
            data-testid="emergency-contact-country-search"
            placeholder="Search country or code"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={activeOptionId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <ul
            id={listId}
            role="listbox"
            className="emergency-contact-country-select-list"
            data-testid="emergency-contact-country-list"
            aria-label={ariaLabel ?? 'Country codes'}
          >
            {visibleOptions.length === 0 && (
              <li
                className="emergency-contact-country-select-empty"
                data-testid="emergency-contact-country-empty"
              >
                No countries found
              </li>
            )}
            {visibleOptions.map((option, index) => {
              if (option.divider) {
                return (
                  <li
                    key={`divider-${index}`}
                    className="emergency-contact-country-select-divider"
                    aria-hidden
                  />
                )
              }

              selectableRenderIndex += 1
              const optionIndex = selectableRenderIndex
              const isActive = optionIndex === activeIndex
              const code = option.value as Country | undefined

              if (!code) {
                return (
                  <li
                    key={`intl-${index}`}
                    className="emergency-contact-country-select-row"
                    role="presentation"
                  >
                    <div
                      id={optionDomId(optionIndex)}
                      role="option"
                      tabIndex={-1}
                      aria-selected={isActive}
                      className={classNames(
                        'emergency-contact-country-select-option',
                        {
                          'emergency-contact-country-select-option-active':
                            isActive,
                        },
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                      onMouseEnter={() => setActiveIndex(optionIndex)}
                    >
                      <span className="emergency-contact-country-select-option-flag">
                        <Icon label={option.label} />
                      </span>
                      <span className="emergency-contact-country-select-option-label">
                        {option.label}
                      </span>
                    </div>
                  </li>
                )
              }

              const dial = safeCallingCode(code)
              const isCurrentValue = value === code

              return (
                <li
                  key={code}
                  role="presentation"
                  className="emergency-contact-country-select-row"
                >
                  <div
                    id={optionDomId(optionIndex)}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isActive}
                    className={classNames(
                      'emergency-contact-country-select-option',
                      {
                        'emergency-contact-country-select-option-active':
                          isActive,
                        'emergency-contact-country-select-option-selected':
                          isCurrentValue,
                      },
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(optionIndex)}
                  >
                    <span className="emergency-contact-country-select-option-flag">
                      <Icon country={code} label={option.label} />
                    </span>
                    <span className="emergency-contact-country-select-option-label">
                      <span className="emergency-contact-country-select-option-country">
                        {option.label}
                      </span>
                      {dial && (
                        <span className="emergency-contact-country-select-option-dial">
                          {optionDialLabel(dial)}
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
