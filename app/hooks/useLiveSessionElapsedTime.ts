import { useEffect, useMemo, useState } from 'react'

import {
  elapsedMsSinceInstant,
  formatElapsedStopwatchFromMs,
  isInstantInPast,
  LIVE_SESSION_REMINDER_MS,
} from '~/utils/dateUtils'

interface UseLiveSessionElapsedTimeParams {
  sessionStartInstant?: string | null
  expectedReturnInstant?: string | null
}

/**
 * Live timer / reminder flags. `nowTick` stays null until mount so SSR and the
 * first client paint match (Date.now() must not run during hydrate).
 */
export const useLiveSessionElapsedTime = ({
  sessionStartInstant,
  expectedReturnInstant,
}: UseLiveSessionElapsedTimeParams) => {
  const [nowTick, setNowTick] = useState<number | null>(null)

  useEffect(() => {
    if (sessionStartInstant == null || sessionStartInstant === '') {
      setNowTick(null)
      return
    }

    setNowTick(Date.now())
    const intervalId = window.setInterval(() => {
      setNowTick(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [sessionStartInstant])

  const elapsedTimerLabel = useMemo(() => {
    if (
      nowTick == null ||
      sessionStartInstant == null ||
      sessionStartInstant === ''
    ) {
      return ''
    }
    return formatElapsedStopwatchFromMs(
      elapsedMsSinceInstant(sessionStartInstant, nowTick),
    )
  }, [sessionStartInstant, nowTick])

  const showStillSurfingPrompt = useMemo(() => {
    if (
      nowTick == null ||
      sessionStartInstant == null ||
      sessionStartInstant === ''
    ) {
      return false
    }
    return (
      elapsedMsSinceInstant(sessionStartInstant, nowTick) >=
      LIVE_SESSION_REMINDER_MS
    )
  }, [sessionStartInstant, nowTick])

  const isPastExpectedReturn = useMemo(() => {
    if (
      nowTick == null ||
      expectedReturnInstant == null ||
      expectedReturnInstant === ''
    ) {
      return false
    }
    return isInstantInPast(expectedReturnInstant, nowTick)
  }, [expectedReturnInstant, nowTick])

  return {
    elapsedTimerLabel,
    showStillSurfingPrompt,
    isPastExpectedReturn,
  }
}
