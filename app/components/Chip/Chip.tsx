interface ChipProps {
  label: string
  isFilled: boolean
}

export const Chip = ({ label, isFilled }: ChipProps) => (
  <div className={`chip ${isFilled && 'filled'}`}>{label}</div>
)
