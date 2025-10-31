import TextButton from '../TextButton'
import ViewSwitch from '../ViewSwitch'

interface ToolbarProps {
  showAddButton: boolean
  onAddNewSpot: () => void
  onOpenFilters: () => void
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
    </>
  )
}

export default Toolbar
