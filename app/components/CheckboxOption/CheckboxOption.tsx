interface IProps {
  name: string
  title: string
  /** Omit for a single-line checkbox (title only). */
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const CheckboxOption = ({
  name,
  title,
  description,
  checked,
  onChange,
}: IProps) => (
  <label className="checkbox-option space-between gap">
    <span className="flex-1">
      <p className="bold">{title}</p>
      {description ? (
        <p className="font-small">{description}</p>
      ) : null}
    </span>
    <input
      name={name}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="custom-checkbox"></span>
  </label>
)
