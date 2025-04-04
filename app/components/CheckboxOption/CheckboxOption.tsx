interface IProps {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const CheckboxOption = ({
  title,
  description,
  checked,
  onChange,
}: IProps) => (
  <label className="row space-between gap">
    <span className="flex-1">
      <p>{title}</p>
      <p className="font-small">{description}</p>
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="checkmark"></span>
  </label>
)
