import { useEffect, ReactNode } from 'react'
import { Modal, Button, Loading, TextButton } from '~/components'
import { SelectionItem } from './index'

interface SelectionModalProps<T extends SelectionItem> {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  items: T[]
  isLoading: boolean
  onLoadItems?: () => void
  isItemSelected: (item: T) => boolean
  onAdd: (item: T) => void
  onRemove: (item: T) => void
  addingItemId: string | null
  removingItemId: string | null
  renderItem?: (item: T, isSelected: boolean, isAdding: boolean, isRemoving: boolean) => ReactNode
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateCtaText?: string
  emptyStateCtaAction?: () => void
  error?: string
  onError?: (error: string) => void
}

export function SelectionModal<T extends SelectionItem>({
  isOpen,
  onClose,
  title,
  description,
  items,
  isLoading,
  onLoadItems,
  isItemSelected,
  onAdd,
  onRemove,
  addingItemId,
  removingItemId,
  renderItem,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateCtaText,
  emptyStateCtaAction,
  error,
  onError,
}: SelectionModalProps<T>) {
  // Load items when modal opens
  useEffect(() => {
    if (isOpen && onLoadItems) {
      onLoadItems()
    }
  }, [isOpen, onLoadItems])

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  if (!isOpen) return null

  const defaultRenderItem = (item: T, isSelected: boolean, isAdding: boolean, isRemoving: boolean) => {
    const showRemoveButton = isRemoving
      ? true
      : isAdding
        ? false
        : isSelected

    return (
      <div key={item.id} className="selection-item">
        <div className="selection-item-content">
          <div className="selection-item-header">
            <div className="selection-item-info">
              <span className="selection-item-name bold">{item.name}</span>
              {item.subtitle && (
                <span className="selection-item-subtitle bold text-secondary">{item.subtitle}</span>
              )}
            </div>
            <div className="selection-item-action">
              {showRemoveButton ? (
                <TextButton
                  text="Remove"
                  onClick={() => onRemove(item)}
                  iconKey="bin"
                  filled
                  danger
                  loading={isRemoving}
                  disabled={!!addingItemId || !!removingItemId}
                />
              ) : (
                <TextButton
                  text="Add"
                  onClick={() => onAdd(item)}
                  iconKey="plus"
                  filled
                  loading={isAdding}
                  disabled={!!addingItemId || !!removingItemId}
                />
              )}
            </div>
          </div>
          {item.metadata && (
            <p className="selection-item-metadata text-secondary">{item.metadata}</p>
          )}
          {item.description && (
            <p className="text-secondary">{item.description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Modal onClose={onClose}>
      <div className="selection-modal">
        <div className="selection-header">
          <h2>{title}</h2>
          {description && <p className="selection-description">{description}</p>}
        </div>
        {isLoading ? (
          <div className="selection-loading">
            <Loading />
          </div>
        ) : items.length === 0 ? (
          <div>
            <p>{emptyStateTitle || 'No items available.'}</p>
            {emptyStateDescription && (
              <p className="text-secondary">{emptyStateDescription}</p>
            )}
            {emptyStateCtaText && emptyStateCtaAction && (
              <div className="selection-actions">
                <Button
                  label={emptyStateCtaText}
                  variant="primary"
                  onClick={emptyStateCtaAction}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="selection-list">
              {items.map((item) => {
                const isSelected = isItemSelected(item)
                const isAdding = addingItemId === item.id
                const isRemoving = removingItemId === item.id

                return renderItem
                  ? renderItem(item, isSelected, isAdding, isRemoving)
                  : defaultRenderItem(item, isSelected, isAdding, isRemoving)
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
