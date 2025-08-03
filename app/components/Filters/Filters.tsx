import { memo, useState } from 'react'

import { Button, CheckboxOption, Rating } from '../index'
import {
  SkillLevel,
  SurfSpotType,
  BeachBottomType,
  Tide,
} from '~/types/surfSpots'
import { FilterState } from './index'
import {
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  HAZARDS,
  PARKING_OPTIONS,
  FACILITIES,
} from '~/types/formData'
import { Option } from '../FormInput'

interface IProps {
  onApplyFilters?: (filters: any) => void // TODO: Remove 'any'
}

export const Filters = memo((props: IProps) => {
  const { onApplyFilters } = props

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    skillLevel: [],
    breakType: [],
    beachBottom: [],
    tide: [],
    rating: 0,
    parking: [],
    foodNearby: [],
    accommodationNearby: [],
    hazards: [],
    facilities: [],
  })

  const skillLevels = Object.values(SkillLevel)
  const breakTypes = Object.values(SurfSpotType)
  const beachBottoms = Object.values(BeachBottomType)
  const tides = Object.values(Tide)

  const parkingOptions = [
    ...PARKING_OPTIONS.slice(1, PARKING_OPTIONS.length - 1),
    { key: 'boatRequired', value: 'boat required', label: 'Boat required' },
  ]

  const handleFilterChange = (category: keyof FilterState, value: string) =>
    setSelectedFilters((prev) => ({
      ...prev,
      [category]:
        Array.isArray(prev[category]) && prev[category].includes(value)
          ? (prev[category] as string[]).filter((item) => item !== value)
          : [...(prev[category] as string[]), value],
    }))

  const handleOptionFilterChange = (
    category: keyof FilterState,
    option: Option,
  ) =>
    setSelectedFilters((prev) => ({
      ...prev,
      [category]:
        Array.isArray(prev[category]) &&
        (prev[category] as Option[]).some((item) => item.value === option.value)
          ? (prev[category] as Option[]).filter(
              (item) => item.value !== option.value,
            )
          : [...(prev[category] as Option[]), option],
    }))

  const handleBooleanFilterChange = (category: keyof FilterState) =>
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))

  const handleRatingChange = (rating?: number) =>
    setSelectedFilters((prev) => ({
      ...prev,
      rating: rating || 0,
    }))

  const handleApplyFilters = () => onApplyFilters?.(selectedFilters)

  const handleClearFilters = () =>
    setSelectedFilters({
      skillLevel: [],
      breakType: [],
      beachBottom: [],
      tide: [],
      rating: 0,
      parking: [],
      foodNearby: [],
      accommodationNearby: [],
      hazards: [],
      facilities: [],
    })

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
                checked={selectedFilters.foodNearby.some(
                  (item) => item.value === option.value,
                )}
                onChange={() => handleOptionFilterChange('foodNearby', option)}
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
                checked={selectedFilters.accommodationNearby.some(
                  (item) => item.value === option.value,
                )}
                onChange={() =>
                  handleOptionFilterChange('accommodationNearby', option)
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
