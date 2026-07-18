import { useCallback, useEffect, useState } from "react"

import Button from "../Button"
import Icon from "../Icon"

import { useToastContext } from "~/contexts"

import {
  ERROR_END_SESSION_SPOT_SELECTION,
  SUCCESS_END_SESSION_SPOT_CLEARED,
} from "~/utils/errorUtils"

interface EndSessionSpotConfirmButtonProps {
  spotId: string
  spotName: string
  isSelectedForSession: boolean
  onConfirmSpot: (spotId: string) => void
  onClearSpot: () => void
}

export const EndSessionSpotConfirmButton = ({
  spotId,
  spotName,
  isSelectedForSession,
  onConfirmSpot,
  onClearSpot,
}: EndSessionSpotConfirmButtonProps) => {
  const { showSuccess, showError } = useToastContext()

  const [isSelected, setIsSelected] = useState(isSelectedForSession)

  useEffect(() => {
    setIsSelected(isSelectedForSession)
  }, [isSelectedForSession, spotId])

  const handleConfirm = useCallback(() => {
    try {
      onConfirmSpot(spotId)
      setIsSelected(true)
      showSuccess(`${spotName} selected for this session.`)
    } catch (error) {
      console.error("End session spot selection failed", error)
      showError(ERROR_END_SESSION_SPOT_SELECTION)
    }
  }, [onConfirmSpot, showError, showSuccess, spotId, spotName])

  const handleRemove = useCallback(() => {
    try {
      onClearSpot()
      setIsSelected(false)
      showSuccess(SUCCESS_END_SESSION_SPOT_CLEARED)
    } catch (error) {
      console.error("End session spot removal failed", error)
      showError(ERROR_END_SESSION_SPOT_SELECTION)
    }
  }, [onClearSpot, showError, showSuccess])

  return (
    <div className="end-session-spot-drawer-footer">
      {isSelected && (
        <p className="end-session-spot-drawer-footer-hint font-small text-secondary m-0" role="status">
          <span
            className="end-session-spot-drawer-footer-hint-icon"
            aria-hidden
          >
            <Icon iconKey="success" useCurrentColor />
          </span>

          <span className="font-small">Selected for this session</span>
        </p>
      )}

      <div className="drawer-form-actions">
        {isSelected ? (
          <Button
            label="Remove from session"
            type="button"
            variant="secondary"
            onClick={handleRemove}
          />
        ) : (
          <Button label="Use this spot" type="button" onClick={handleConfirm} />
        )}
      </div>
    </div>
  )
}

export default EndSessionSpotConfirmButton
