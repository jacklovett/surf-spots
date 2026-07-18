import { useNavigate } from 'react-router'

import { Button, Icon } from '~/components'
import { liveSessionDetailsPath } from '~/constants/liveSessionPaths'
import { useLiveSessionContext } from '~/contexts'
import { useEndLiveSession } from '~/hooks/useEndLiveSession'

interface StartLiveSessionSuccessProps {
  message: string
  startedSessionId: number | null
}

export const StartLiveSessionSuccess = ({
  message,
  startedSessionId,
}: StartLiveSessionSuccessProps) => {
  const navigate = useNavigate()
  const { inProgressSession } = useLiveSessionContext()
  const { endSession, isEnding } = useEndLiveSession()
  const endSessionId = inProgressSession?.id ?? startedSessionId

  const handleEndSession = () => {
    if (endSessionId == null || isEnding) {
      return
    }
    endSession(endSessionId, {
      onSuccess: () => navigate(liveSessionDetailsPath(endSessionId)),
    })
  }

  return (
    <div className="surf-spot-form-success-wrapper">
      <div className="surf-spot-form-success column">
        <div className="ph center column">
          <div className="surf-spot-form-success-icon mb">
            <Icon iconKey="success" useCurrentColor />
          </div>
          <p className="surf-spot-form-success-message bold">{message}</p>
          <p className="surf-spot-form-success-subtext">
            Your session is in progress. End it when you are done.
          </p>
          {!!endSessionId && (
            <div className="surf-spot-form-success-actions">
              <Button
                label="End session"
                type="button"
                loading={isEnding}
                disabled={isEnding}
                onClick={handleEndSession}
              />
              <Button
                label="Home"
                type="button"
                variant="secondary"
                onClick={() => navigate('/surf-spots')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StartLiveSessionSuccess
