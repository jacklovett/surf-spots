import { memo, useState } from 'react'

import { Button, CheckboxOption, Rating } from '../index'
import {
  SkillLevel,
  SurfSpotType,
  BeachBottomType,
  Tide,
  WaveDirection,
  SurfSpotFilters,
  defaultSurfSpotFilters,
} from '~/types/surfSpots'
import {
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  HAZARDS,
  PARKING_OPTIONS,
  FACILITIES,
} from '~/types/formData'
import { Option } from '../FormInput'
import { useLayoutContext, useSurfSpotsContext } from '~/contexts'

export const Filters = memo(() => {
  const { filters, setFilters } = useSurfSpotsContext()
  const { closeDrawer } = useLayoutContext()

  const [selectedFilters, setSelectedFilters] =
    useState<SurfSpotFilters>(filters)

  const skillLevels = Object.values(SkillLevel)
  const breakTypes = Object.values(SurfSpotType)
  const beachBottoms = Object.values(BeachBottomType)
  const tides = Object.values(Tide)
  const waveDirections = Object.values(WaveDirection)

  const parkingOptions = [
    ...PARKING_OPTIONS.slice(1, PARKING_OPTIONS.length - 1),
    { key: 'boatRequired', value: 'boat required', label: 'Boat required' },
  ]

  /**
   * Generic toggle function for array filters
   * Handles both string arrays (skillLevel, breakType, etc.) and Option object arrays (parking, foodOptions, etc.)
   *
   * @param category - The filter category to update (e.g., 'skillLevel', 'parking')
   * @param value - The value to toggle (string for simple filters, Option object for complex filters)
   * @param isOption - Whether this is an Option object filter (true) or string filter (false)
   */
  const toggleArrayFilter = (
    category: keyof SurfSpotFilters,
    value: string | Option,
    isOption = false,
  ) => {
    setSelectedFilters((prev) => {
      const current = prev[category] as (string | Option)[]

      let updated: (string | Option)[]

      if (isOption) {
        // Handle Option object arrays (parking, foodOptions, accommodationOptions, hazards, facilities)
        const option = value as Option
        const isSelected = current.some(
          (item) => (item as Option).value === option.value,
        )
        updated = isSelected
          ? current.filter((item) => (item as Option).value !== option.value)
          : [...current, value]
      } else {
        // Handle string arrays (skillLevel, breakType, beachBottom, tide)
        const stringValue = value as string
        const isSelected = current.includes(stringValue)
        updated = isSelected
          ? current.filter((item) => item !== stringValue)
          : [...current, value]
      }

      return { ...prev, [category]: updated }
    })
  }

  // Toggle a string value in an array filter (e.g. skillLevel, breakType, etc.)
  const handleFilterChange = (category: keyof SurfSpotFilters, value: string) =>
    toggleArrayFilter(category, value, false)

  // Toggle an Option object in an array filter (e.g. parking, foodOptions, etc.)
  const handleOptionFilterChange = (
    category: keyof SurfSpotFilters,
    option: Option,
  ) => toggleArrayFilter(category, option, true)

  // Set the rating filter (number)
  const handleRatingChange = (rating?: number) =>
    setSelectedFilters((prev) => ({
      ...prev,
      rating: rating || 0,
    }))

  // Apply filters: update global context
  const handleApplyFilters = () => {
    setFilters(selectedFilters)
    closeDrawer()
  }

  // Clear all filters to their default state
  const handleClearFilters = () => {
    setSelectedFilters(defaultSurfSpotFilters)
    setFilters(defaultSurfSpotFilters)
  }

  return (
    <div className="filters-container">
      <div className="filters-content">
        <div className="filters-content-section">
          <h3 className="filters-content-title">Skill Level</h3>
          <div className="filters-content-options">
            {skillLevels.map((level) => (
              <CheckboxOption
                key={level}
                name={`skill-${level}`}
                title={level}
                description=""
                checked={selectedFilters.skillLevel.includes(level)}
                onChange={() => handleFilterChange('skillLevel', level)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Break Type</h3>
          <div className="filters-content-options">
            {breakTypes.map((type) => (
              <CheckboxOption
                key={type}
                name={`break-${type}`}
                title={type}
                description=""
                checked={selectedFilters.breakType.includes(type)}
                onChange={() => handleFilterChange('breakType', type)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Beach Bottom</h3>
          <div className="filters-content-options">
            {beachBottoms.map((bottom) => (
              <CheckboxOption
                key={bottom}
                name={`bottom-${bottom}`}
                title={bottom}
                description=""
                checked={selectedFilters.beachBottom.includes(bottom)}
                onChange={() => handleFilterChange('beachBottom', bottom)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Tide</h3>
          <div className="filters-content-options">
            {tides.map((tide) => (
              <CheckboxOption
                key={tide}
                name={`tide-${tide}`}
                title={tide}
                description=""
                checked={selectedFilters.tide.includes(tide)}
                onChange={() => handleFilterChange('tide', tide)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Wave Direction</h3>
          <div className="filters-content-options">
            {waveDirections.map((direction) => (
              <CheckboxOption
                key={direction}
                name={`wave-${direction}`}
                title={direction}
                description=""
                checked={selectedFilters.waveDirection.includes(direction)}
                onChange={() => handleFilterChange('waveDirection', direction)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Minimum Rating</h3>
          <div className="filters-content-rating">
            <Rating
              value={selectedFilters.rating}
              onChange={handleRatingChange}
              readOnly={false}
            />
            <span className="rating-label">
              {selectedFilters.rating > 0
                ? `${selectedFilters.rating}+ stars`
                : 'Any rating'}
            </span>
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Parking</h3>
          <div className="filters-content-options">
            {parkingOptions.map((option: Option) => (
              <CheckboxOption
                key={option.key}
                name={`parking-${option.value}`}
                title={option.label}
                description=""
                checked={selectedFilters.parking.some(
                  (item) => item.value === option.value,
                )}
                onChange={() => handleOptionFilterChange('parking', option)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Food Options</h3>
          <div className="filters-content-options">
            {FOOD_OPTIONS.map((option) => (
              <CheckboxOption
                key={option.key}
                name={`food-${option.value}`}
                title={option.label}
                description=""
                checked={selectedFilters.foodOptions.some(
                  (item) => item.value === option.value,
                )}
                onChange={() => handleOptionFilterChange('foodOptions', option)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Accomodation Options</h3>
          <div className="filters-content-options">
            {ACCOMMODATION_TYPES.map((option) => (
              <CheckboxOption
                key={option.key}
                name={`accommodation-${option.value}`}
                title={option.label}
                description=""
                checked={selectedFilters.accommodationOptions.some(
                  (item) => item.value === option.value,
                )}
                onChange={() =>
                  handleOptionFilterChange('accommodationOptions', option)
                }
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Hazards</h3>
          <div className="filters-content-options">
            {HAZARDS.map((option) => (
              <CheckboxOption
                key={option.key}
                name={`hazard-${option.value}`}
                title={option.label}
                description=""
                checked={selectedFilters.hazards.some(
                  (item) => item.value === option.value,
                )}
                onChange={() => handleOptionFilterChange('hazards', option)}
              />
            ))}
          </div>
        </div>

        <div className="filters-content-section">
          <h3 className="filters-content-title">Facilities</h3>
          <div className="filters-content-options">
            {FACILITIES.map((option) => (
              <CheckboxOption
                key={option.key}
                name={`facility-${option.value}`}
                title={option.label}
                description=""
                checked={selectedFilters.facilities.some(
                  (item) => item.value === option.value,
                )}
                onChange={() => handleOptionFilterChange('facilities', option)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="row gap filters-content-actions">
        <Button
          onClick={handleClearFilters}
          variant="secondary"
          label="Clear All"
        />
        <Button onClick={handleApplyFilters} label="Apply Filters" />
      </div>
    </div>
  )
})

Filters.displayName = 'Filters'
