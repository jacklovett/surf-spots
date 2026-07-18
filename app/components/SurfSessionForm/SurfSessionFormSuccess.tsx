import { useEffect, useState } from 'react'
import { useNavigate, useNavigation } from 'react-router'

import { Button, Icon } from '~/components'

interface SurfSessionFormSuccessProps {
  message: string
  subtext: string
  endSessionAddSpotPath: string | null
  showViewSpot: boolean
  resolvedSpotPath: string | null
  onCancel: () => void
}

export const SurfSessionFormSuccess = ({
  message,
  subtext,
  endSessionAddSpotPath,
  showViewSpot,
  resolvedSpotPath,
  onCancel,
}: SurfSessionFormSuccessProps) => {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [successCtaPending, setSuccessCtaPending] = useState<
    'sessions' | 'spot' | 'add-spot' | null
  >(null)

  useEffect(() => {
    if (navigation.state === 'idle') {
      setSuccessCtaPending(null)
    }
  }, [navigation.state])

  return (
    <div className="surf-spot-form-success-wrapper">
      <div className="surf-spot-form-success column">
        <div className="ph center column">
          <div className="surf-spot-form-success-icon mb">
            <Icon iconKey="success" useCurrentColor />
          </div>
          <p className="surf-spot-form-success-message bold">{message}</p>
          <p className="surf-spot-form-success-subtext">{subtext}</p>
          <div className="surf-spot-form-success-actions">
            <Button
              label="Sessions"
              type="button"
              loading={successCtaPending === 'sessions'}
              disabled={
                successCtaPending === 'spot' || successCtaPending === 'add-spot'
              }
              onClick={() => {
                setSuccessCtaPending('sessions')
                navigate('/sessions')
              }}
            />
            {!!endSessionAddSpotPath && (
              <Button
                label="Add spot"
                type="button"
                variant="secondary"
                loading={successCtaPending === 'add-spot'}
                disabled={successCtaPending === 'sessions'}
                onClick={() => {
                  setSuccessCtaPending('add-spot')
                  navigate(endSessionAddSpotPath)
                }}
              />
            )}
            {showViewSpot && (
              <Button
                label="View spot"
                type="button"
                variant="secondary"
                loading={successCtaPending === 'spot'}
                disabled={
                  successCtaPending === 'sessions' ||
                  successCtaPending === 'add-spot'
                }
                onClick={() => {
                  setSuccessCtaPending('spot')
                  if (resolvedSpotPath) {
                    navigate(resolvedSpotPath)
                    return
                  }
                  onCancel()
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurfSessionFormSuccess
