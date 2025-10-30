import Chip from '../Chip'
import { Option } from '../FormInput'

interface ChipSelectorProps {
  options: Option[]
  selected: Option[]
  onChange: (selected: Option[]) => void
  name: string
}

export const ChipSelector = ({
  options,
  selected,
  onChange,
  name,
}: ChipSelectorProps) => {
  const toggleSelection = (option: Option) => {
    const isSelected = selected.some((item) => item.key === option.key)
    const updatedSelection = isSelected
      ? selected.filter((item) => item.key !== option.key)
      : [...selected, option]
    onChange(updatedSelection)
  }

  return (
    <div className="chip-selector">
      {options.map((option) => (
        <div key={option.key} onClick={() => toggleSelection(option)}>
          <Chip
            label={option.label}
            isFilled={selected.some((item) => item.key === option.key)}
          />
        </div>
      ))}

      {/* Generate one hidden input per selected value */}
      {selected.map((item) => (
        <input key={item.key} type="hidden" name={name} value={item.value} />
      ))}
    </div>
  )
}
