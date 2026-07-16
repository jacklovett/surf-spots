interface IProps {
  name: string
  title: string
  /** Omit for a single-line checkbox (title only). */
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

export const CheckboxOption = ({
  name,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: IProps) => (
  <label
    className={`checkbox-option space-between gap ${
      disabled ? 'checkbox-option-disabled' : ''
    }`}
  >
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
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className="custom-checkbox"></span>
  </label>
)
