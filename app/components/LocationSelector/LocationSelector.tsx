import { useEffect, useState, ChangeEvent, memo } from 'react'
import { FormInput } from '~/components'
import { InputElementType, SelectOption } from '../FormInput'
import { Location } from './index'

interface IProps {
  locationData?: Location[]
  selectedCountry: string
  selectedCity: string
  onCountryChange: (country: string) => void
  onCityChange: (city: string) => void
}

export const LocationSelector = memo(
  ({
    locationData = [],
    selectedCountry,
    selectedCity,
    onCountryChange,
    onCityChange,
  }: IProps) => {
    // Initialize countries based on locationData directly
    const countries = Array.from(
      new Set(locationData.map((entry) => entry.country)),
    )

    const [cities, setCities] = useState<string[]>([])

    // Update cities when country changes
    useEffect(() => {
      if (selectedCountry) {
        const countryCities = locationData
          .filter((entry) => entry.country === selectedCountry)
          .map((entry) => entry.city)
          .sort()

        setCities(countryCities)
        // Validate if current city is still valid
        if (selectedCity && !countryCities.includes(selectedCity)) {
          onCityChange('')
        }
      } else {
        setCities([])
      }
    }, [selectedCountry, selectedCity, locationData])

    // Handle changes with validation
    const handleCountryChange = (e: ChangeEvent<InputElementType>) =>
      onCountryChange(e.target.value)

    const handleCityChange = (e: ChangeEvent<InputElementType>) =>
      onCityChange(e.target.value)

    // Options for select inputs
    const countryOptions: SelectOption[] = [
      { key: 'Select country', label: 'Select a country', value: '' },
      ...countries.map((country) => ({
        label: country,
        value: country,
        key: country,
      })),
    ]

    // Add selectedCity as a default option while cities array is empty
    const cityOptions: SelectOption[] = [
      { key: 'Select city', label: 'Select a city', value: '' },
      ...(cities.length > 0
        ? cities.map((city) => ({
            label: city,
            value: city,
            key: `${selectedCountry}-${city}`,
          }))
        : selectedCity
        ? [
            {
              label: selectedCity,
              value: selectedCity,
              key: `default-${selectedCity}`,
            },
          ]
        : []),
    ]

    return (
      <div className="form-inline">
        <FormInput
          field={{
            label: 'Country',
            name: 'country',
            type: 'select',
            options: countryOptions,
          }}
          value={selectedCountry}
          onChange={handleCountryChange}
          showLabel={!!selectedCountry}
        />
        <FormInput
          field={{
            label: 'City',
            name: 'city',
            type: 'select',
            options: cityOptions,
          }}
          value={selectedCity}
          onChange={handleCityChange}
          showLabel={!!selectedCity}
          disabled={!selectedCountry}
        />
      </div>
    )
  },
)

LocationSelector.displayName = 'LocationSelector'
