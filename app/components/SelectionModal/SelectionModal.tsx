import { useEffect, ReactNode } from 'react'
import { Modal, Button, Loading, TextButton } from '~/components'
import { SelectionItem } from './index'

export interface HeaderProps {
  title: string
  description?: string
}

export interface EmptyStateProps {
  title?: string
  description?: string
  ctaText?: string
  ctaAction?: () => void
}

export interface FooterProps {
  buttonText?: string
  buttonAction?: () => void
}

export interface ErrorProps {
  error?: string
  onError?: (error: string) => void
}

export interface SelectionActionsProps<T extends SelectionItem> {
  isItemSelected: (item: T) => boolean
  onAdd: (item: T) => void
  onRemove: (item: T) => void
  addingItemId: string | null
  removingItemId: string | null
}

export interface SelectionModalProps<T extends SelectionItem> {
  isOpen: boolean
  onClose: () => void
  header: HeaderProps
  items: T[]
  isLoading: boolean
  onLoadItems?: () => void
  selectionActions: SelectionActionsProps<T>
  renderItem?: (item: T, isSelected: boolean, isAdding: boolean, isRemoving: boolean) => ReactNode
  emptyState?: EmptyStateProps
  footer?: FooterProps
  error?: ErrorProps
}

export function SelectionModal<T extends SelectionItem>({
  isOpen,
  onClose,
  header,
  items,
  isLoading,
  onLoadItems,
  selectionActions,
  renderItem,
  emptyState,
  footer,
  error,
}: SelectionModalProps<T>) {
  const { isItemSelected, onAdd, onRemove, addingItemId, removingItemId } = selectionActions

  // Load items when modal opens
  useEffect(() => {
    if (isOpen && onLoadItems) {
      onLoadItems()
    }
  }, [isOpen, onLoadItems])

  // Handle errors
  useEffect(() => {
    if (error?.error && error?.onError) {
      error.onError(error.error)
    }
  }, [error])

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
          <h2>{header.title}</h2>
          {header.description && <p className="selection-description">{header.description}</p>}
        </div>
        {isLoading ? (
          <div className="selection-loading">
            <Loading />
          </div>
        ) : items.length === 0 ? (
          <div className="selection-empty-state">
            <p className="selection-empty-title bold">{emptyState?.title || 'No items available.'}</p>
            {emptyState?.description && (
              <p className="selection-empty-description text-secondary">{emptyState.description}</p>
            )}
            {emptyState?.ctaText && emptyState?.ctaAction && (
              <div className="selection-actions">
                <Button
                  label={emptyState.ctaText}
                  variant="primary"
                  onClick={emptyState.ctaAction}
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
            {footer?.buttonText && footer?.buttonAction && (
              <div className="selection-actions">
                <Button
                  label={footer.buttonText}
                  variant="secondary"
                  onClick={footer.buttonAction}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
