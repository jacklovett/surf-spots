import { useEffect, useMemo, useState } from 'react'

import {
  elapsedMsSinceInstant,
  formatElapsedStopwatchSinceInstant,
  isInstantInPast,
  LIVE_SESSION_REMINDER_MS,
} from '~/utils/dateUtils'

interface UseLiveSessionElapsedTimeParams {
  sessionStartInstant?: string | null
  expectedReturnInstant?: string | null
}

export const useLiveSessionElapsedTime = ({
  sessionStartInstant,
  expectedReturnInstant,
}: UseLiveSessionElapsedTimeParams) => {
  const [nowTick, setNowTick] = useState(Date.now())

  useEffect(() => {
    if (sessionStartInstant == null || sessionStartInstant === '') {
      return
    }

    const intervalId = window.setInterval(() => {
      setNowTick(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [sessionStartInstant])

  const elapsedTimerLabel = useMemo(() => {
    if (sessionStartInstant == null || sessionStartInstant === '') {
      return ''
    }
    return formatElapsedStopwatchSinceInstant(sessionStartInstant)
  }, [sessionStartInstant, nowTick])

  const showStillSurfingPrompt = useMemo(() => {
    if (sessionStartInstant == null || sessionStartInstant === '') {
      return false
    }
    return elapsedMsSinceInstant(sessionStartInstant) >= LIVE_SESSION_REMINDER_MS
  }, [sessionStartInstant, nowTick])

  const isPastExpectedReturn = useMemo(() => {
    if (expectedReturnInstant == null || expectedReturnInstant === '') {
      return false
    }
    return isInstantInPast(expectedReturnInstant)
  }, [expectedReturnInstant, nowTick])

  return {
    elapsedTimerLabel,
    showStillSurfingPrompt,
    isPastExpectedReturn,
  }
}
