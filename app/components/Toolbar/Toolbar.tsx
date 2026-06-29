import TextButton from '../TextButton'
import ViewSwitch from '../ViewSwitch'

interface ToolbarProps {
  onOpenFilters: () => void
  filtersBadge?: number
  isMapView: boolean
  onToggleView: () => void
  hideFilters?: boolean
  hideToolbarBorder?: boolean
}

export const Toolbar = (props: ToolbarProps) => {
  const {
    onOpenFilters,
    filtersBadge,
    isMapView,
    onToggleView,
    hideFilters,
    hideToolbarBorder = false,
  } = props

  return (
    <div
      className={`row toolbar flex-end space-between ${hideToolbarBorder ? ' toolbar--map-view' : ''}`}
    >
      <div className="row flex-1">
        {!hideFilters && (
          <TextButton
            text="Filters"
            onClick={onOpenFilters}
            iconKey="filters"
            badge={filtersBadge}
          />
        )}
      </div>
      <ViewSwitch
        isPrimaryView={isMapView}
        onToggleView={onToggleView}
        primaryLabel="Map"
        secondaryLabel="List"
      />
    </div>
  )
}

export default Toolbar
