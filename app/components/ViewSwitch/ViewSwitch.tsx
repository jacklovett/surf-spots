interface IProps {
  isPrimaryView: boolean
  onToggleView: () => void
  primaryLabel: string
  secondaryLabel: string
}

export const ViewSwitch = (props: IProps) => {
  const { isPrimaryView, onToggleView, primaryLabel, secondaryLabel } = props

  return (
    <div className="view-switch">
      <span
        className={`view-switch-label ${isPrimaryView ? 'active' : ''}`}
        onClick={onToggleView}
      >
        {primaryLabel}
      </span>
      <span className="separator">|</span>
      <span
        className={`view-switch-label ${!isPrimaryView ? 'active' : ''}`}
        onClick={onToggleView}
      >
        {secondaryLabel}
      </span>
    </div>
  )
}
