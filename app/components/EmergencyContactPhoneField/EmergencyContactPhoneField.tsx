import PhoneInput, { type Value } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import classNames from 'classnames'

import { countryNameToPhoneDefaultCountry } from '~/utils/countryNameToPhoneDefaultCountry'

import { EmergencyContactCountrySelect } from './EmergencyContactCountrySelect'
import 'react-phone-number-input/style.css'

interface EmergencyContactPhoneFieldProps {
  value: string
  onChange: (phone: string) => void
  onBlur: () => void
  errorMessage: string
  showLabel: boolean
  /** Profile "Country" field (English name, e.g. from cities_countries.json). */
  profileCountryName: string
}

export const EmergencyContactPhoneField = ({
  value,
  onChange,
  onBlur,
  errorMessage,
  showLabel,
  profileCountryName,
}: EmergencyContactPhoneFieldProps) => {
  const defaultCountry = countryNameToPhoneDefaultCountry(profileCountryName)

  return (
    <div
      className={classNames('form-item', 'emergency-contact-phone', {
        error: !!errorMessage,
      })}
      data-testid="emergency-contact-phone-field"
    >
      <label
        className={showLabel ? 'visible' : ''}
        htmlFor="emergencyContactPhone-input"
      >
        Phone
      </label>
      <input type="hidden" name="emergencyContactPhone" value={value} readOnly />
      <PhoneInput
        flags={flags}
        countrySelectComponent={EmergencyContactCountrySelect}
        international={false}
        initialValueFormat="national"
        defaultCountry={defaultCountry}
        addInternationalOption={false}
        value={value || undefined}
        onChange={(next?: Value) => {
          onChange(next ?? '')
        }}
        onBlur={onBlur}
        numberInputProps={{
          id: 'emergencyContactPhone-input',
          'aria-invalid': errorMessage ? true : undefined,
        }}
        placeholder="Phone number"
      />
      {errorMessage ? <span className="form-error">{errorMessage}</span> : null}
    </div>
  )
}
