import classNames from 'classnames'

interface IProps {
  isPrimaryView: boolean
  onToggleView: () => void
  primaryLabel: string
  secondaryLabel: string
}

export const ViewSwitch = (props: IProps) => {
  const { isPrimaryView, onToggleView, primaryLabel, secondaryLabel } = props

  return (
    <div className="view-switch" onClick={onToggleView}>
      <span
        className={classNames({
          'view-switch-label': true,
          active: isPrimaryView,
        })}
      >
        {primaryLabel}
      </span>
      <span className="separator"></span>
      <span
        className={classNames({
          'view-switch-label': true,
          active: !isPrimaryView,
        })}
      >
        {secondaryLabel}
      </span>
    </div>
  )
}
