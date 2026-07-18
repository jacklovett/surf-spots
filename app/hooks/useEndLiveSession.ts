import { useLiveSessionContext } from '~/contexts/LiveSessionContext'

export type { EndLiveSessionOptions } from '~/contexts/LiveSessionContext'

export const useEndLiveSession = () => {
  const { endSession, isEnding } = useLiveSessionContext()
  return { endSession, isEnding }
}
