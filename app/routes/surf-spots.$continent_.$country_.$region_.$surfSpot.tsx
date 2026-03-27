import { useEffect, useRef, useCallback } from 'react'
import {
  ActionFunction,
  data,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
  useLocation,
} from 'react-router'

import { cacheControlHeader, get, post, deleteData } from '~/services/networkService'
import { handleSaveSessionFeedback } from '~/services/surfSpot.server'
import { requireSessionCookie, getSession, commitSession } from '~/services/session.server'
import {
  SurfSpot,
  SurfSpotNote,
  Tide,
  SkillLevel,
  SurfSpotStatus,
  SurfSessionSummary,
} from '~/types/surfSpots'
import { Surfboard } from '~/types/surfboard'

import {
  CalendarIcon,
  Chip,
  ContentStatus,
  Details,
  DirectionIcon,
  ErrorBoundary,
  InfoMessage,
  SafeLink,
  SurfHeightIcon,
  SurfMap,
  SurfSpotActions,
  SurfSpotNoteForm,
  TextButton,
  TideIcon,
} from '~/components'
import { submitFetcher } from '~/components/SurfSpotActions'
import { FetcherSubmitParams, ActionData } from '~/types/api'

import { useUserContext, useSettingsContext, useLayoutContext, useToastContext, useSurfSpotsContext, useSignUpPromptContext } from '~/contexts'

import { getDisplayMessage } from '~/services/networkService'
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_BOUNDARY_MAP,
  ERROR_BOUNDARY_SECTION,
  ERROR_INVALID_SURF_SPOT_ID,
  ERROR_INVALID_TRIP_ACTION,
  ERROR_SAVE_NOTE,
  ERROR_SURF_SPOT_ID_REQUIRED,
  ERROR_TRIP_AND_SPOT_IDS_REQUIRED,
  ERROR_TRIP_AND_TRIP_SPOT_IDS_REQUIRED,
  ERROR_MISSING_REQUIRED_FIELDS,
  SUCCESS_NOTE_SAVED,
  getSafeFetcherErrorMessage,
} from '~/utils/errorUtils'
import {
  formatSurfHeightRange,
  formatSeason,
  getNoveltyWaveLabel,
  resolveSurfSpotActionUrl,
} from '~/utils/surfSpotUtils'

interface LoaderData {
  surfSpotDetails?: SurfSpot
  note?: SurfSpotNote | null
  sessionSummary?: SurfSessionSummary | null
  surfboards: Surfboard[]
  error?: string
}

/**
 * Helper function to create error responses
 */
const createErrorResponse = (
  message: string,
  status: number = 500,
  submitStatus?: string,
): ReturnType<typeof data> => data<ActionData>(
    {
      success: false,
      submitStatus: submitStatus || message,
      hasError: true,
    },
    { status },
  )

/**
 * Helper function to handle saving a surf spot note
 */
const handleSaveNote = async (
  formData: FormData,
  userId: string,
  cookie: string,
): Promise<ReturnType<typeof data>> => {
  const surfSpotId = formData.get('surfSpotId') as string

  if (!surfSpotId) {
    return createErrorResponse(ERROR_SURF_SPOT_ID_REQUIRED, 400)
  }

  const noteText = (formData.get('noteText') as string)?.trim() || ''
  const preferredTideValue = formData.get('preferredTide') as string
  const skillRequirementValue = formData.get('skillRequirement') as string

  const noteData: SurfSpotNote = {
    noteText,
    preferredTide: preferredTideValue ? (preferredTideValue as Tide) : null,
    preferredSwellDirection: (formData.get('preferredSwellDirection') as string)?.trim() || null,
    preferredWind: (formData.get('preferredWind') as string)?.trim() || null,
    preferredSwellRange: (formData.get('preferredSwellRange') as string)?.trim() || null,
    skillRequirement: skillRequirementValue ? (skillRequirementValue as SkillLevel) : null,
  }

  const savedNote = await post<typeof noteData & { userId: string }, SurfSpotNote>(
    `surf-spots/id/${surfSpotId}/notes`,
    { ...noteData, userId },
    { headers: { Cookie: cookie } },
  )

  return data<ActionData & { note: SurfSpotNote }>({
    success: true,
    submitStatus: SUCCESS_NOTE_SAVED,
    hasError: false,
    note: savedNote,
  })
}

/**
 * Helper function to handle trip actions
 */
const handleTripAction = async (
  intent: string,
  formData: FormData,
  userId: string,
  cookie: string,
): Promise<ReturnType<typeof data>> => {
  const tripId = formData.get('tripId') as string
  const tripSpotId = formData.get('tripSpotId') as string
  const spotSurfSpotId = formData.get('surfSpotId') as string

  if (intent === 'add-spot') {
    if (!tripId || !spotSurfSpotId) {
      return data(
        { error: ERROR_TRIP_AND_SPOT_IDS_REQUIRED },
        { status: 400 },
      )
    }
    const newTripSpotId = await post<undefined, string>(
      `trips/${tripId}/spots/${spotSurfSpotId}?userId=${userId}`,
      undefined,
      { headers: { Cookie: cookie } },
    )
    return data({ success: true, tripSpotId: newTripSpotId })
  }

  if (intent === 'remove-spot') {
    if (!tripId || !tripSpotId) {
      return data(
        { error: ERROR_TRIP_AND_TRIP_SPOT_IDS_REQUIRED },
        { status: 400 },
      )
    }
    await deleteData(
      `trips/${tripId}/spots/${tripSpotId}?userId=${userId}`,
      { headers: { Cookie: cookie } },
    )
    return data({ success: true })
  }

  return data({ error: ERROR_INVALID_TRIP_ACTION }, { status: 400 })
}

/**
 * Helper function to handle surf spot actions (watch list / surfed spots)
 */
const handleSurfSpotAction = async (
  actionType: string,
  target: string,
  surfSpotId: string,
  userId: string,
  cookie: string,
  surfSpotNameForFeedback: string,
): Promise<ReturnType<typeof data>> => {
  const surfSpotIdNumber = Number(surfSpotId)
  if (isNaN(surfSpotIdNumber)) {
    return data(
      { error: ERROR_INVALID_SURF_SPOT_ID },
      { status: 400 },
    )
  }

  const endpoint =
    actionType === 'add'
      ? `${target}`
      : `${target}/${userId}/remove/${surfSpotIdNumber}`

  const session = await getSession(cookie)

  if (actionType === 'add') {
    await post(
      endpoint,
      { userId, surfSpotId: surfSpotIdNumber },
      { headers: { Cookie: cookie } },
    )
  } else {
    await deleteData(endpoint, { headers: { Cookie: cookie } })
  }

  return data(
    {
      success: true,
      surfSpotAction: { actionType, target },
      addedToSurfedSpots: actionType === 'add' && target === 'user-spots',
      surfSpotIdForFeedback: surfSpotId,
      surfSpotNameForFeedback: surfSpotNameForFeedback.trim() || undefined,
    },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

export const action: ActionFunction = async ({ request }) => {
  try {
    // Authenticate user and get cookie before reading formData
    const user = await requireSessionCookie(request)
    const cookie = request.headers.get('Cookie') || ''
    const formData = await request.formData()
    const intent = formData.get('intent') as string
    const actionType = formData.get('actionType') as string
    const target = formData.get('target') as string
    const surfSpotId = formData.get('surfSpotId') as string
    const userId = String(user.id)

    // Handle note saving
    if (intent === 'saveNote') {
      return await handleSaveNote(formData, userId, cookie)
    }

    if (intent === 'saveSessionFeedback') {
      return await handleSaveSessionFeedback(formData, userId, cookie)
    }

    // Handle trip actions
    if (intent === 'add-spot' || intent === 'remove-spot') {
      return await handleTripAction(intent, formData, userId, cookie)
    }

    // Handle surf spot actions (watch list / surfed spots)
    if (!actionType || !target || !surfSpotId) {
      return data(
        { error: ERROR_MISSING_REQUIRED_FIELDS },
        { status: 400 },
      )
    }

    const surfSpotName = (formData.get('surfSpotName') as string) || ''
    return await handleSurfSpotAction(
      actionType,
      target,
      surfSpotId,
      userId,
      cookie,
      surfSpotName,
    )
  } catch (error) {
    console.error('Error in action:', error)

    if (error instanceof Response) return error

    const errorMessage = getDisplayMessage(error)
    const status = error instanceof Error && 'status' in error
      ? (error as { status?: number }).status || 500
      : 500

    return createErrorResponse(errorMessage, status)
  }
}

/**
 * Helper function to load a user's note for a surf spot
 */
const loadUserNote = async (
  surfSpotId: string,
  userId: string,
  cookie: string,
): Promise<SurfSpotNote | null> => {
  try {
    const note = await get<SurfSpotNote>(
      `surf-spots/id/${surfSpotId}/notes/${userId}`,
      { headers: { Cookie: cookie } },
    )
    return note
  } catch (error) {
    // 404 means note doesn't exist yet, which is fine.
    // Use status when available because display messages are sanitized.
    const status =
      error instanceof Error && 'status' in error
        ? (error as { status?: number }).status
        : undefined
    if (status !== 404) {
      console.error('Error fetching surf spot note:', error)
    }
    return null
  }
}

/**
 * Session summary is optional; failures do not block the detail page.
 */
const loadSessionSummaryForSpot = async (
  spotId: string | undefined,
  userId: string,
  cookie: string,
): Promise<SurfSessionSummary | null> => {
  if (!spotId) return null
  try {
    return await get<SurfSessionSummary>(
      `surf-spots/${spotId}/sessions?userId=${encodeURIComponent(userId)}`,
      { headers: { Cookie: cookie } },
    )
  } catch (error) {
    console.error('Error fetching session summary for surf spot:', error)
    return null
  }
}

const loadSurfboardsForUser = async (
  userId: string,
  cookie: string,
): Promise<Surfboard[]> => {
  try {
    return await get<Surfboard[]>(`surfboards?userId=${userId}`, {
      headers: { Cookie: cookie },
    })
  } catch {
    return []
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { surfSpot: surfSpotSlug, country: countrySlug, region: regionSlug } = params
  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    // Build API URL with optional userId
    const queryParams = new URLSearchParams()
    if (userId) queryParams.set('userId', userId)
    if (countrySlug) queryParams.set('countrySlug', countrySlug)
    if (regionSlug) queryParams.set('regionSlug', regionSlug)
    const queryString = queryParams.toString()
    const url = queryString
      ? `surf-spots/${surfSpotSlug}?${queryString}`
      : `surf-spots/${surfSpotSlug}`

    const cookie = request.headers.get('Cookie') || ''
    const surfSpotDetails = await get<SurfSpot>(
      url,
      userId ? { headers: { Cookie: cookie } } : {},
    )

    const spotId = surfSpotDetails?.id

    // Authenticated-only fetches in parallel (note + session summary + quiver).
    const emptyAuth: readonly [null, null, Surfboard[]] = [null, null, []]
    const authenticatedDataPromise = userId
      ? Promise.all([
          spotId
            ? loadUserNote(spotId, userId, cookie)
            : Promise.resolve(null),
          loadSessionSummaryForSpot(spotId, userId, cookie),
          loadSurfboardsForUser(userId, cookie),
        ])
      : Promise.resolve(emptyAuth)

    const [note, sessionSummary, surfboards] = await authenticatedDataPromise

    return data<LoaderData>(
      { surfSpotDetails, note, sessionSummary, surfboards },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surf spot details: ', error)
    return data<LoaderData>(
      {
        surfboards: [],
        error: `We can't seem to locate this surf spot. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function SurfSpotDetails() {
  const { surfSpotDetails, note, sessionSummary, surfboards, error } =
    useLoaderData<LoaderData>()
  const { user } = useUserContext()
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings
  const { openDrawer } = useLayoutContext()
  const { showSuccess, showError } = useToastContext()
  const { setNote, setNoteSubmissionComplete } = useSurfSpotsContext()
  const { showSignUpPrompt } = useSignUpPromptContext()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const fetcher = useFetcher<ActionData>()
  const noteFetcher = useFetcher<ActionData & { note?: SurfSpotNote }>()
  const lastProcessedDataRef = useRef<typeof noteFetcher.data>(undefined)
  const lastFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  useEffect(() => {
    if (searchParams.has('success')) {
      showSuccess('Surf spot saved successfully')
      navigate(location.pathname, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount; navigate clears query

  // Set note in context from loader data
  useEffect(() => {
    if (surfSpotDetails?.id) {
      const noteValue = note ?? null
      setNote(surfSpotDetails.id.toString(), noteValue)
    }
  }, [surfSpotDetails?.id, note])

  // Surf spot actions fetcher: toast on error
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && fetcher.data !== lastFetcherDataRef.current) {
      lastFetcherDataRef.current = fetcher.data
      const actionResult = fetcher.data as ActionData
      const hadError =
        !!actionResult.error ||
        !!(actionResult.hasError && actionResult.submitStatus)
      if (hadError) {
        const errorMessage = getSafeFetcherErrorMessage(fetcher.data, DEFAULT_ERROR_MESSAGE)
        showError(errorMessage)
      }
    }
    if (fetcher.state === 'submitting') {
      lastFetcherDataRef.current = undefined
    }
  }, [fetcher.data, fetcher.state, showError])

  // Handle note form submission - show toast and update context
  useEffect(() => {
    // Only process if we have data and it's different from what we last processed
    if (noteFetcher.state === 'idle' && noteFetcher.data && noteFetcher.data !== lastProcessedDataRef.current) {
      lastProcessedDataRef.current = noteFetcher.data

      if (noteFetcher.data.success) {
        const successMsg =
          typeof noteFetcher.data.submitStatus === 'string' && noteFetcher.data.submitStatus.trim()
            ? noteFetcher.data.submitStatus.trim()
            : SUCCESS_NOTE_SAVED
        showSuccess(successMsg)
        // Update context directly with saved note
        if (surfSpotDetails?.id && noteFetcher.data.note) {
          setNote(surfSpotDetails.id.toString(), noteFetcher.data.note)
        }
      } else {
        const errorMessage = getSafeFetcherErrorMessage(
          noteFetcher.data,
          ERROR_SAVE_NOTE,
        )
        showError(errorMessage)
      }

      // Signal that submission is complete
      setNoteSubmissionComplete(true)
    }
    if (noteFetcher.state === 'submitting') {
      setNoteSubmissionComplete(false)
      lastProcessedDataRef.current = undefined
    }
  }, [noteFetcher.data, noteFetcher.state, surfSpotDetails?.id, showSuccess, showError, setNote, setNoteSubmissionComplete])
   
  const onFetcherSubmit = useCallback(
    (params: FetcherSubmitParams) => {
      try {
        submitFetcher(
          params,
          fetcher,
          resolveSurfSpotActionUrl(location.pathname),
        )
      } catch (error) {
        console.error('Error submitting fetcher:', error)
        showError(DEFAULT_ERROR_MESSAGE)
      }
    },
    [fetcher, showError, location.pathname],
  )

  const handleOpenNotesDrawer = () => {
    if (!surfSpotDetails) return

    // If user is not logged in, show sign up prompt
    if (!user) {
      showSignUpPrompt('notes')
      return
    }

    const drawerContent = (
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <SurfSpotNoteForm
          key={`note-form-${surfSpotDetails.id}`}
          surfSpotId={surfSpotDetails.id.toString()}
          surfSpotName={surfSpotDetails.name}
          fetcher={noteFetcher}
          action={location.pathname}
        />
      </ErrorBoundary>
    )
    openDrawer(drawerContent, 'right', 'My Notes')
  }

if (error || !surfSpotDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? 'Surf spot details not found.'}</p>
      </ContentStatus>
    )
  }
  const {
    beachBottomType,
    description,
    name,
    skillLevel,
    type,
    tide,
    waveDirection,
    swellDirection,
    windDirection,
    minSurfHeight,
    maxSurfHeight,
    swellSeason,
    boatRequired,
    isWavepool,
    wavepoolUrl,
    isRiverWave,
    parking,
    foodNearby,
    foodTypes,
    accommodationNearby,
    accommodationTypes,
    hazards,
    facilities,
    forecasts,
    webcams,
  } = surfSpotDetails

  const isNoveltyWave = isWavepool || isRiverWave
  const noveltyLabel = getNoveltyWaveLabel({ isWavepool, isRiverWave })

  const viewerUserId = user?.id
  const isCreator = !!viewerUserId && viewerUserId === surfSpotDetails.createdBy
  const isPendingVisibleToCreator =
    isCreator && surfSpotDetails.status === SurfSpotStatus.PENDING
  const showReportIssueMessage =
    !isCreator && surfSpotDetails.status === SurfSpotStatus.APPROVED

  return (
    <div className="mb-l">
      <div className="content column">
        <div className="row space-between">
          <div className="page-title-with-status">
            <h1>{name}</h1>
          </div>
          <div className="spot-actions">
            <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
              <SurfSpotActions
                surfSpot={surfSpotDetails}
                navigate={navigate}
                user={user}
                onFetcherSubmit={onFetcherSubmit}
                surfActionFetcher={fetcher}
                surfboards={surfboards}
              />
            </ErrorBoundary>
          </div>
        </div>
        <div className="row space-between mb surf-spot-detail-meta-row">
          <div className="surf-spot-novelty-chip-wrap">
            {noveltyLabel && <Chip label={noveltyLabel} isFilled={false} />}
          </div>
          <div className="surf-spot-detail-meta-row-notes row gap">
            <TextButton
              text={note ? "Show Notes" : "Add Notes"}
              onClick={handleOpenNotesDrawer}
              iconKey="clipboard"
            />
          </div>
        </div>
        {isPendingVisibleToCreator && (
          <InfoMessage message="This spot is pending approval and is only visible to you until it is approved." />
        )}
        <p className="description">{description}</p>
        <div className="row spot-details gap mb pv">
          <Details label="Break Type" value={type} />
          <Details label="Beach Bottom" value={beachBottomType} />
          <Details label="Wave Direction" value={waveDirection} />
          <Details label="Skill Level" value={skillLevel} />
        </div>
      </div>
      <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
        <div className="map-wrapper mv">
          <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
        </div>
      </ErrorBoundary>
      <div className="content pt">
        {(isNoveltyWave && swellSeason) && (
          <section>
            <h3>Best Conditions</h3>
            <div className="best-conditions">
              <div className="best-conditions-item">
                <CalendarIcon />
                <Details label="Season" value={formatSeason(swellSeason)} />
              </div>
            </div>
          </section>
        )}
        {!isNoveltyWave && (
          <>
            <section>
              <h3>Best Conditions</h3>
              <div className="best-conditions">
                <div className="best-conditions-item">
                  <DirectionIcon type="swell" directionRange={swellDirection} />
                  <Details label="Swell Direction" value={swellDirection} />
                </div>
                <div className="best-conditions-item">
                  <DirectionIcon type="wind" directionRange={windDirection} />
                  <Details label="Wind Direction" value={windDirection} />
                </div>
                <div className="best-conditions-item">
                  <TideIcon tide={tide} />
                  <Details label="Tides" value={tide} />
                </div>
                <div className="best-conditions-item">
                  <SurfHeightIcon />
                  <Details
                    label="Surf Height"
                    value={formatSurfHeightRange(
                      preferredUnits,
                      minSurfHeight,
                      maxSurfHeight,
                    )}
                  />
                </div>
                <div className="best-conditions-item">
                  <CalendarIcon />
                  <Details label="Season" value={formatSeason(swellSeason)} />
                </div>
              </div>
            </section>
            <section>
              <h3>Surf Forecasts</h3>
              {forecasts && forecasts.length > 0 ? (
                <>
                  <p>
                    Looking for real time conditions? Below is a list of
                    forecasts to check out
                  </p>
                  <div className="column mv">
                    {/* TODO: add icons/logos for well known forecasting sites */}
                    {forecasts.map((forecast) => (
                      <SafeLink key={forecast} url={forecast}>
                        {forecast}
                      </SafeLink>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  Know a reliable forecast for this spot? Let us know and share
                  the love!
                </p>
              )}
            </section>
            <section>
              <h3>Webcams</h3>
              {webcams && webcams.length > 0 ? (
                <>
                  <p>
                    Live views of the spot. Check the webcams before you go.
                  </p>
                  <div className="column mv">
                    {webcams.map((webcam) => (
                      <SafeLink key={webcam} url={webcam}>
                        {webcam}
                      </SafeLink>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  Know a webcam for this spot? Let us know and we can add it!
                </p>
              )}
            </section>
          </>
        )}
        {isWavepool && wavepoolUrl && (
          <section>
            <h3>Official Website</h3>
            <p>
              For booking, pricing, and wave schedules, visit the official
              website:
            </p>
            <div className="mv">
              <SafeLink url={wavepoolUrl} className="wavepool-website-link">
                {wavepoolUrl}
              </SafeLink>
            </div>
          </section>
        )}
        <section>
          <h3>Amenities</h3>
          <div className="amenities-content">
            <div className="amenities-section">
              <h4>Access</h4>
              <div className="amenities-details">
                {boatRequired && (
                  <div className="details">
                    <p className="label">Boat is required</p>
                  </div>
                )}
                <Details label="Parking" value={parking} />
              </div>
            </div>

            <div className="amenities-section">
              <h4>Facilities</h4>
              <div className="amenities-list">
                {facilities && facilities.length > 0 ? (
                  facilities.map((facility: string) => (
                    <span key={facility} className="amenities-item">
                      {facility}
                    </span>
                  ))
                ) : (
                  <span className="amenities-item empty">
                    No facilities listed
                  </span>
                )}
              </div>
            </div>

            {accommodationNearby &&
              accommodationTypes &&
              accommodationTypes.length > 0 && (
                <div className="amenities-section">
                  <h4>Accommodation Options</h4>
                  <div className="amenities-list">
                    {accommodationTypes.map((accommodationType: string) => (
                      <span key={accommodationType} className="amenities-item">
                        {accommodationType}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {foodNearby && foodTypes && foodTypes.length > 0 && (
              <div className="amenities-section">
                <h4>Food Options</h4>
                <div className="amenities-list">
                  {foodTypes.map((foodType: string) => (
                    <span key={foodType} className="amenities-item">
                      {foodType}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        <section>
          <h3>Hazards</h3>
          <div className="amenities-content">
            <div className="amenities-section">
              <div className="amenities-list">
                {hazards && hazards.length > 0 ? (
                  hazards.map((hazard: string) => (
                    <span key={hazard} className="amenities-item">
                      {hazard}
                    </span>
                  ))
                ) : (
                  <span className="amenities-item empty">
                    No hazards listed
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        {sessionSummary && sessionSummary.sampleSize > 0 && (
          <section>
            <h3>Surfers like you</h3>
            <div className="column gap">
              <p className="bold">{sessionSummary.segmentHeadline}</p>
              {sessionSummary.waveQualityTrendLine && (
                <p>{sessionSummary.waveQualityTrendLine}</p>
              )}
              {sessionSummary.crowdTrendLine && (
                <p>{sessionSummary.crowdTrendLine}</p>
              )}
              {sessionSummary.wouldSurfAgainLine && (
                <p>{sessionSummary.wouldSurfAgainLine}</p>
              )}
            </div>
          </section>
        )}
        {showReportIssueMessage && (
          <InfoMessage message="See something not right? Let us know so we can get it fixed" />
        )}
      </div>
    </div>
  )
}
