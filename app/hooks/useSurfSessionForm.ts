import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFetcher } from 'react-router'

import { useLiveSessionContext, useUserContext } from '~/contexts'
import { FormField } from '~/components/FormInput'
import { ActionData } from '~/types/api'
import { Surfboard } from '~/types/surfboard'
import { buildSurfSessionSurfboardField } from '~/types/formData/surfSessionForm'
import {
  formatDate,
  formatDateForInput,
  formatDurationCompact,
  formatSurfSessionTimeRange,
  sessionWindowMinutesFromTimeInputs,
  timeToHHmm,
} from '~/utils/dateUtils'
import {
  ERROR_SAVE_SURF_SESSION,
  ERROR_UPDATE_SURF_SESSION,
  ERROR_END_LIVE_SURF_SESSION,
  getFetcherSubmitStatus,
  SUCCESS_SURF_SESSION_SAVED,
  SUCCESS_SURF_SESSION_UPDATED,
  SUCCESS_SURF_SESSION_ENDED,
} from '~/utils/errorUtils'
import { scrollPageToTop } from '~/utils/scrollPageToTop'
import {
  isSurfSessionTimingBannerMessage,
  validateSurfSessionTimeWindow,
} from '~/utils/surfSessionTimingValidation'
import { SurfSessionListItem } from '~/types/surfSpots'
import {
  sessionHasRecordedLiveStartLocation,
  buildAddSurfSpotPathForUnassignedSession,
} from '~/utils/surfSessionFormUtils'
import { sessionDirectionStoredToArray } from '~/utils/surfSpotUtils'

import { useEndSessionSpotResolution } from './useEndSessionSpotResolution'

export interface UseSurfSessionFormParams {
  surfSpotId: string
  surfSpotName: string
  formActionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  surfboards?: Surfboard[]
  requiresSkillLevel?: boolean
  onCancel: () => void
  mode?: 'create' | 'edit' | 'end'
  initialSession?: SurfSessionListItem
  externalEditNotice?: string | null
  sessionId?: string
  sessionAlreadyEnded?: boolean
  initialShowSuccessScreen?: boolean
}

export const useSurfSessionForm = (params: UseSurfSessionFormParams) => {
  const {
    surfSpotId,
    surfSpotName,
    formActionPath,
    fetcher,
    surfboards = [],
    requiresSkillLevel = false,
    onCancel,
    mode = 'create',
    initialSession,
    externalEditNotice,
    sessionId,
    sessionAlreadyEnded = false,
    initialShowSuccessScreen = false,
  } = params

  const { user } = useUserContext()
  const { clearInProgressSession, refreshInProgressSession } =
    useLiveSessionContext()
  const [successSpotAssignment, setSuccessSpotAssignment] = useState<{
    isUnassigned: boolean
    spotId: string
  } | null>(null)
  const [showSuccessScreen, setShowSuccessScreen] = useState(
    initialShowSuccessScreen,
  )
  const [sessionDate, setSessionDate] = useState(() =>
    formatDateForInput(new Date()),
  )
  const [swellDirectionArray, setSwellDirectionArray] = useState<string[]>([])
  const [windDirectionArray, setWindDirectionArray] = useState<string[]>([])
  const [tide, setTide] = useState('')
  const [waveSize, setWaveSize] = useState('')
  const [waveFace, setWaveFace] = useState('')
  const [crowdLevel, setCrowdLevel] = useState('')
  const [sessionRating, setSessionRating] = useState<number | undefined>()
  const [skillLevel, setSkillLevel] = useState('')
  const [surfboardId, setSurfboardId] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState('')
  const [sessionEndTime, setSessionEndTime] = useState('')
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  const boardField: FormField = useMemo(
    () => buildSurfSessionSurfboardField(surfboards),
    [surfboards],
  )

  const sessionTimingError = useMemo(
    () => validateSurfSessionTimeWindow(sessionStartTime, sessionEndTime),
    [sessionStartTime, sessionEndTime],
  )

  const sessionWindowPreview = useMemo(() => {
    if (sessionTimingError) {
      return null
    }

    const mins = sessionWindowMinutesFromTimeInputs(
      sessionStartTime,
      sessionEndTime,
    )

    // mins is a number — keep null check so 0 minutes still formats
    if (mins == null) {
      return null
    }

    return formatDurationCompact(mins)
  }, [sessionTimingError, sessionStartTime, sessionEndTime])

  const hasManualTimeInputs = !!sessionStartTime || !!sessionEndTime

  const isEndMode = mode === 'end'

  const attachStoredSessionInstantsToPayload =
    (mode === 'edit' || (isEndMode && sessionAlreadyEnded)) &&
    !!initialSession &&
    !hasManualTimeInputs &&
    (!!initialSession.sessionStartInstant || !!initialSession.sessionEndInstant)

  const canEditLiveSessionSpot =
    sessionHasRecordedLiveStartLocation(initialSession) &&
    (isEndMode || mode === 'edit')
  const showLiveSessionSpotSection = canEditLiveSessionSpot

  const hasRecordedLiveSessionTiming =
    showLiveSessionSpotSection &&
    !!initialSession?.sessionStartInstant &&
    !!initialSession?.sessionEndInstant

  const recordedSessionDateLabel = initialSession?.sessionDate
    ? formatDate(initialSession.sessionDate)
    : null

  const recordedSessionWindowLabel = initialSession
    ? formatSurfSessionTimeRange(initialSession)
    : null

  const endSessionSpotResolution = useEndSessionSpotResolution({
    startLatitude: initialSession?.startLatitude,
    startLongitude: initialSession?.startLongitude,
    userId: user?.id,
    initialSurfSpotId: initialSession?.surfSpotId
      ? String(initialSession.surfSpotId)
      : '',
    initialSurfSpotName: initialSession?.surfSpotName ?? null,
  })

  const fetcherSubmitStatus = getFetcherSubmitStatus(
    fetcher.data,
    isEndMode
      ? sessionAlreadyEnded
        ? ERROR_UPDATE_SURF_SESSION
        : ERROR_END_LIVE_SURF_SESSION
      : mode === 'edit'
        ? ERROR_UPDATE_SURF_SESSION
        : ERROR_SAVE_SURF_SESSION,
  )
  const formSubmitStatus =
    fetcherSubmitStatus?.isError &&
    !isSurfSessionTimingBannerMessage(fetcherSubmitStatus.message)
      ? fetcherSubmitStatus
      : null

  const fetcherReturnedSaveSuccess =
    fetcher.state === 'idle' &&
    !!fetcher.data?.success &&
    !fetcher.data.hasError

  const keepSubmitBusyUntilSuccessUi =
    fetcherReturnedSaveSuccess && !showSuccessScreen

  const isFormValid = useMemo(() => {
    if (isEndMode) {
      return !requiresSkillLevel || !!skillLevel
    }
    return (
      !!sessionDate &&
      (!requiresSkillLevel || !!skillLevel) &&
      !sessionTimingError
    )
  }, [isEndMode, sessionDate, requiresSkillLevel, skillLevel, sessionTimingError])

  const resetFields = useCallback(() => {
    setSessionDate(formatDateForInput(new Date()))
    setSwellDirectionArray([])
    setWindDirectionArray([])
    setTide('')
    setWaveSize('')
    setWaveFace('')
    setCrowdLevel('')
    setSessionRating(undefined)
    setSkillLevel('')
    setSurfboardId('')
    setSessionNotes('')
    setSessionStartTime('')
    setSessionEndTime('')
  }, [])

  const handleFormCancel = useCallback(() => {
    resetFields()
    setShowSuccessScreen(false)
    setSuccessSpotAssignment(null)
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [onCancel, resetFields])

  useEffect(() => {
    if (mode === 'edit') {
      return
    }
    resetFields()
    setShowSuccessScreen(false)
    setSuccessSpotAssignment(null)
    lastProcessedFetcherDataRef.current = undefined
  }, [surfSpotId, mode, resetFields])

  useEffect(() => {
    if (mode !== 'edit' || !initialSession) {
      return
    }
    const isoDate = initialSession.sessionDate
    setSessionDate(
      isoDate.length >= 10
        ? isoDate.slice(0, 10)
        : formatDateForInput(new Date(isoDate)),
    )
    setSwellDirectionArray(
      sessionDirectionStoredToArray(initialSession.swellDirection),
    )
    setWindDirectionArray(
      sessionDirectionStoredToArray(initialSession.windDirection),
    )
    setTide(initialSession.tide ?? '')
    setWaveSize(initialSession.waveSize ?? '')
    setWaveFace(initialSession.waveFace ?? '')
    setCrowdLevel(initialSession.crowdLevel ?? '')
    setSessionRating(initialSession.sessionRating ?? undefined)
    setSkillLevel(initialSession.skillLevel ?? '')
    setSurfboardId(initialSession.surfboardId ?? '')
    setSessionNotes(initialSession.sessionNotes ?? '')
    setSessionStartTime(timeToHHmm(initialSession.sessionStartTime ?? ''))
    setSessionEndTime(timeToHHmm(initialSession.sessionEndTime ?? ''))
  }, [initialSession])

  useEffect(() => {
    setShowSuccessScreen(initialShowSuccessScreen)
    if (!initialShowSuccessScreen) {
      setSuccessSpotAssignment(null)
      lastProcessedFetcherDataRef.current = undefined
      return
    }

    if (showLiveSessionSpotSection && initialSession) {
      setSuccessSpotAssignment({
        isUnassigned: !initialSession.surfSpotId,
        spotId: initialSession.surfSpotId
          ? String(initialSession.surfSpotId)
          : '',
      })
    }
  }, [
    initialSession?.id,
    initialSession?.surfSpotId,
    mode,
    initialShowSuccessScreen,
    showLiveSessionSpotSection,
    initialSession,
  ])

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      const shouldShowSuccess = !!fetcher.data.success && !fetcher.data.hasError
      if (shouldShowSuccess) {
        scrollPageToTop()
        if (showLiveSessionSpotSection) {
          setSuccessSpotAssignment({
            isUnassigned: !endSessionSpotResolution.selectedSpotId,
            spotId: endSessionSpotResolution.selectedSpotId,
          })
        }
        if (isEndMode) {
          clearInProgressSession()
          refreshInProgressSession()
        }
      }
      setShowSuccessScreen(shouldShowSuccess)
    }
  }, [
    fetcher.state,
    fetcher.data,
    isEndMode,
    showLiveSessionSpotSection,
    endSessionSpotResolution.selectedSpotId,
    clearInProgressSession,
    refreshInProgressSession,
  ])

  const defaultSuccessMessage = isEndMode
    ? sessionAlreadyEnded
      ? SUCCESS_SURF_SESSION_SAVED
      : SUCCESS_SURF_SESSION_ENDED
    : mode === 'edit'
      ? SUCCESS_SURF_SESSION_UPDATED
      : SUCCESS_SURF_SESSION_SAVED

  const successMessage =
    fetcherSubmitStatus && !fetcherSubmitStatus.isError
      ? fetcherSubmitStatus.message
      : defaultSuccessMessage

  const successSpotId =
    showSuccessScreen && successSpotAssignment
      ? successSpotAssignment.spotId
      : endSessionSpotResolution.selectedSpotId

  const isUnassignedGpsSession =
    showLiveSessionSpotSection &&
    (showSuccessScreen && successSpotAssignment
      ? successSpotAssignment.isUnassigned
      : !initialSession?.surfSpotId && !endSessionSpotResolution.selectedSpotId)

  const addSpotSessionId =
    sessionId ?? (initialSession?.id ? String(initialSession.id) : null)

  const endSessionAddSpotPath =
    isUnassignedGpsSession &&
    endSessionSpotResolution.sessionCoordinates &&
    addSpotSessionId
      ? buildAddSurfSpotPathForUnassignedSession({
          id: Number(addSpotSessionId),
          startLatitude: endSessionSpotResolution.sessionCoordinates.latitude,
          startLongitude: endSessionSpotResolution.sessionCoordinates.longitude,
        })
      : null

  const endSessionSpotPath = successSpotId
    ? endSessionSpotResolution.nearbySpots.find(
        (spot) => String(spot.id) === successSpotId,
      )?.path ?? null
    : null

  const resolvedSpotPathForSuccess =
    endSessionSpotPath ??
    (showSuccessScreen && successSpotAssignment?.isUnassigned
      ? null
      : (initialSession?.spotPath ?? null))

  const showViewSpotOnSuccess =
    !endSessionAddSpotPath &&
    (!showLiveSessionSpotSection
      ? mode !== 'end'
      : !!resolvedSpotPathForSuccess)

  const endSessionSuccessSubtext = endSessionAddSpotPath
    ? "This location isn't listed yet. You can add it as a spot so you never forget where you surfed."
    : isEndMode
      ? 'Open Sessions to see it in your list.'
      : mode === 'edit'
        ? 'Return to My sessions to see the updated entry.'
        : 'Open Sessions to see it in your list, or return to this spot.'

  const pageTitle = isEndMode
    ? sessionAlreadyEnded
      ? 'Session details'
      : 'End session'
    : mode === 'edit'
      ? showLiveSessionSpotSection
        ? 'Edit session'
        : `Edit session at ${surfSpotName}`
      : `Add session at ${surfSpotName}`

  const submitLabel = isEndMode
    ? sessionAlreadyEnded
      ? 'Save details'
      : 'End session'
    : mode === 'edit'
      ? 'Save changes'
      : 'Save session'

  const formIntent = isEndMode
    ? 'updateSurfSession'
    : mode === 'edit'
      ? 'updateSurfSession'
      : 'saveSurfSession'

  const leadText = isEndMode
    ? 'Session ended. Confirm where you surfed and report on how it went.'
    : mode === 'edit'
      ? showLiveSessionSpotSection
        ? 'Update the fields you want for this session, including surf spot if needed.'
        : 'Update the fields you want for this session, then save.'
      : 'Add as much or as little as you like; only the session date is required.'

  const isSubmitting =
    fetcher.state === 'submitting' ||
    fetcher.state === 'loading' ||
    keepSubmitBusyUntilSuccessUi

  return {
    formActionPath,
    fetcher,
    surfSpotId,
    surfboards,
    requiresSkillLevel,
    mode,
    initialSession,
    externalEditNotice,
    sessionId,
    sessionAlreadyEnded,
    showSuccessScreen,
    showLiveSessionSpotSection,
    pageTitle,
    submitLabel,
    formIntent,
    leadText,
    formSubmitStatus,
    isFormValid,
    isSubmitting,
    handleFormCancel,
    successMessage,
    endSessionSuccessSubtext,
    endSessionAddSpotPath,
    showViewSpotOnSuccess,
    resolvedSpotPathForSuccess,
    onCancel,
    isEndMode,
    attachStoredSessionInstantsToPayload,
    endSessionSpotResolution,
    hasRecordedLiveSessionTiming,
    recordedSessionDateLabel,
    recordedSessionWindowLabel,
    boardField,
    sessionTimingError,
    sessionWindowPreview,
    sessionDate,
    setSessionDate,
    swellDirectionArray,
    setSwellDirectionArray,
    windDirectionArray,
    setWindDirectionArray,
    tide,
    setTide,
    waveSize,
    setWaveSize,
    waveFace,
    setWaveFace,
    crowdLevel,
    setCrowdLevel,
    sessionRating,
    setSessionRating,
    skillLevel,
    setSkillLevel,
    surfboardId,
    setSurfboardId,
    sessionNotes,
    setSessionNotes,
    sessionStartTime,
    setSessionStartTime,
    sessionEndTime,
    setSessionEndTime,
  }
}
