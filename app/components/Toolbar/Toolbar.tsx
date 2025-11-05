import TextButton from '../TextButton'
import ViewSwitch from '../ViewSwitch'

interface ToolbarProps {
  showAddButton: boolean
  onAddNewSpot: () => void
  onOpenFilters: () => void
  onOpenTripPlanner: () => void
  filtersBadge?: number
  isMapView: boolean
  onToggleView: () => void
  hideFilters?: boolean
}

export const Toolbar = (props: ToolbarProps) => {
  const {
    showAddButton,
    onAddNewSpot,
    onOpenFilters,
    onOpenTripPlanner,
    filtersBadge,
    isMapView,
    onToggleView,
    hideFilters,
  } = props

  return (
    <>
      <div className="row toolbar flex-end space-between">
        <div className="row flex-1">
          {!hideFilters && (
            <TextButton
              text="Filters"
              onClick={onOpenFilters}
              iconKey="filters"
              badge={filtersBadge}
            />
          )}
          {showAddButton && (
            <div className="toolbar-add">
              <TextButton
                text="Add new spot"
                onClick={onAddNewSpot}
                iconKey="plus"
                filled
              />
            </div>
          )}
        </div>
        <ViewSwitch
          isPrimaryView={isMapView}
          onToggleView={onToggleView}
          primaryLabel="Map"
          secondaryLabel="List"
        />
      </div>

      <div className="floating-add-button">
        {showAddButton && (
          <TextButton
            text="Add new spot"
            onClick={onAddNewSpot}
            iconKey="plus"
            filled
          />
        )}
      </div>

      <div className="floating-trip-planner-button">
        <TextButton
          text="Trip Planner"
          onClick={onOpenTripPlanner}
          iconKey="ai"
          filled
        />
      </div>
    </>
  )
}

export default Toolbar
