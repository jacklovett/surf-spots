import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useFetcher, useRevalidator } from 'react-router'

import { useToastContext } from './ToastContext'
import { useUserContext } from './UserContext'
import { ActionData } from '~/types/api'
import { SurfSessionListItem } from '~/types/surfSpots'
import { END_LIVE_SESSION_RESOURCE_PATH } from '~/constants/liveSessionPaths'
import {
  ERROR_END_LIVE_SURF_SESSION,
  SUCCESS_SURF_SESSION_ENDED,
} from '~/utils/errorUtils'

export interface EndLiveSessionOptions {
  onSuccess?: () => void
  onError?: (message: string) => void
  suppressErrorToast?: boolean
}

interface LiveSessionContextValue {
  inProgressSession: SurfSessionListItem | null
  liveSessionRefreshFailed: boolean
  isEnding: boolean
  refreshInProgressSession: () => void
  setInProgressSession: (session: SurfSessionListItem | null) => void
  clearInProgressSession: () => void
  endSession: (sessionId: number, options?: EndLiveSessionOptions) => void
}

const LiveSessionContext = createContext<LiveSessionContextValue | undefined>(
  undefined,
)

interface LiveSessionProviderProps {
  children: ReactNode
  initialInProgressSession?: SurfSessionListItem | null
  initialLiveSessionRefreshFailed?: boolean
}

export const LiveSessionProvider = ({
  children,
  initialInProgressSession = null,
  initialLiveSessionRefreshFailed = false,
}: LiveSessionProviderProps) => {
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const revalidator = useRevalidator()
  const endFetcher = useFetcher<ActionData>()
  const [inProgressSession, setInProgressSessionState] =
    useState<SurfSessionListItem | null>(initialInProgressSession)
  const [liveSessionRefreshFailed, setLiveSessionRefreshFailed] = useState(
    initialLiveSessionRefreshFailed,
  )
  const pendingEndOptionsRef = useRef<EndLiveSessionOptions | null>(null)
  const isEnding = endFetcher.state !== 'idle'

  useEffect(() => {
    if (initialLiveSessionRefreshFailed) {
      setLiveSessionRefreshFailed(true)
      return
    }
    setLiveSessionRefreshFailed(false)
    setInProgressSessionState(initialInProgressSession)
  }, [initialInProgressSession, initialLiveSessionRefreshFailed])

  useEffect(() => {
    if (!user?.id) {
      setInProgressSessionState(null)
      setLiveSessionRefreshFailed(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (endFetcher.state !== 'idle' || !endFetcher.data) {
      return
    }

    const pendingOptions = pendingEndOptionsRef.current
    pendingEndOptionsRef.current = null

    if (endFetcher.data.success && !endFetcher.data.hasError) {
      setInProgressSessionState(null)
      setLiveSessionRefreshFailed(false)
      showSuccess(endFetcher.data.submitStatus ?? SUCCESS_SURF_SESSION_ENDED)
      pendingOptions?.onSuccess?.()
      return
    }

    const errorMessage =
      endFetcher.data.submitStatus ?? ERROR_END_LIVE_SURF_SESSION
    if (!pendingOptions?.suppressErrorToast) {
      showError(errorMessage)
    }
    pendingOptions?.onError?.(errorMessage)
  }, [endFetcher.data, endFetcher.state, showError, showSuccess])

  const refreshInProgressSession = useCallback(() => {
    if (!user?.id) {
      return
    }
    revalidator.revalidate()
  }, [revalidator, user?.id])

  useEffect(() => {
    if (!user?.id) {
      return
    }

    const refreshWhenTabVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshInProgressSession()
      }
    }

    document.addEventListener('visibilitychange', refreshWhenTabVisible)
    return () =>
      document.removeEventListener('visibilitychange', refreshWhenTabVisible)
  }, [refreshInProgressSession, user?.id])

  const setInProgressSession = useCallback(
    (session: SurfSessionListItem | null) => {
      setInProgressSessionState(session)
      if (session) {
        setLiveSessionRefreshFailed(false)
      }
    },
    [],
  )

  const clearInProgressSession = useCallback(() => {
    setInProgressSessionState(null)
  }, [])

  const endSession = useCallback(
    (sessionId: number, options?: EndLiveSessionOptions) => {
      if (endFetcher.state !== 'idle') {
        return
      }

      pendingEndOptionsRef.current = options ?? null
      const formData = new FormData()
      formData.append('sessionId', String(sessionId))
      endFetcher.submit(formData, {
        method: 'POST',
        action: END_LIVE_SESSION_RESOURCE_PATH,
      })
    },
    [endFetcher],
  )

  const value = useMemo(
    () => ({
      inProgressSession,
      liveSessionRefreshFailed,
      isEnding,
      refreshInProgressSession,
      setInProgressSession,
      clearInProgressSession,
      endSession,
    }),
    [
      clearInProgressSession,
      endSession,
      inProgressSession,
      isEnding,
      liveSessionRefreshFailed,
      refreshInProgressSession,
      setInProgressSession,
    ],
  )

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  )
}

export const useLiveSessionContext = () => {
  const context = useContext(LiveSessionContext)
  if (!context) {
    throw new Error(
      'useLiveSessionContext must be used within LiveSessionProvider',
    )
  }
  return context
}
