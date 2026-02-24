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
import { requireSessionCookie, getSession, commitSession } from '~/services/session.server'
import { SurfSpot, SurfSpotNote, Tide, SkillLevel } from '~/types/surfSpots'

import {
  CalendarIcon,
  ContentStatus,
  Details,
  DirectionIcon,
  ErrorBoundary,
  InfoMessage,
  Rating,
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
  getSafeFetcherErrorMessage,
  ERROR_SAVE_NOTE,
  ERROR_SOMETHING_WENT_WRONG,
} from '~/utils/errorUtils'
import { formatSurfHeightRange, formatSeason } from '~/utils/surfSpotUtils'

interface LoaderData {
  surfSpotDetails?: SurfSpot
  note?: SurfSpotNote | null
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
    return createErrorResponse('Surf spot ID is required', 400)
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
    submitStatus: 'Note saved successfully',
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
      return data({ error: 'Trip ID and surf spot ID are required' }, { status: 400 })
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
      return data({ error: 'Trip ID and trip spot ID are required' }, { status: 400 })
    }
    await deleteData(
      `trips/${tripId}/spots/${tripSpotId}?userId=${userId}`,
      { headers: { Cookie: cookie } },
    )
    return data({ success: true })
  }

  return data({ error: 'Invalid trip action' }, { status: 400 })
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
): Promise<ReturnType<typeof data>> => {
  const surfSpotIdNumber = Number(surfSpotId)
  if (isNaN(surfSpotIdNumber)) {
    return data({ error: 'Invalid surf spot ID' }, { status: 400 })
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
    { success: true },
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

    // Handle trip actions
    if (intent === 'add-spot' || intent === 'remove-spot') {
      return await handleTripAction(intent, formData, userId, cookie)
    }

    // Handle surf spot actions (watch list / surfed spots)
    if (!actionType || !target || !surfSpotId) {
      return data({ error: 'Missing required fields' }, { status: 400 })
    }

    return await handleSurfSpotAction(actionType, target, surfSpotId, userId, cookie)
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
    // 404 means note doesn't exist yet, which is fine
    if (!(error instanceof Error && error.message.includes('404'))) {
      console.error('[LOAD_USER_NOTE] Error fetching note:', error)
    }
    return null
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { surfSpot } = params
  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    // Build API URL with optional userId
    const url = userId
      ? `surf-spots/${surfSpot}?userId=${userId}`
      : `surf-spots/${surfSpot}`

    const surfSpotDetails = await get<SurfSpot>(url)

    // Load note if user is authenticated
    let note: SurfSpotNote | null = null
    if (userId && surfSpotDetails?.id) {
      const cookie = request.headers.get('Cookie') || ''
      note = await loadUserNote(surfSpotDetails.id, userId, cookie)
    }

    return data<LoaderData>(
      { surfSpotDetails, note },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surf spot details: ', error)
    return data<LoaderData>(
      {
        error: `We can't seem to locate this surf spot. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function SurfSpotDetails() {
  const { surfSpotDetails, note, error } = useLoaderData<LoaderData>()
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

  // Surf spot actions fetcher: on error show toast with safe message
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && fetcher.data !== lastFetcherDataRef.current) {
      lastFetcherDataRef.current = fetcher.data
      const data = fetcher.data as ActionData
      if (data.error || (data.hasError && data.submitStatus)) {
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
            : 'Note saved successfully'
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
        // Submit to current route (detail page) which has the action handler
        submitFetcher(params, fetcher, location.pathname)
      } catch (error) {
        console.error('Error submitting fetcher:', error)
        showError(ERROR_SOMETHING_WENT_WRONG)
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
      <ErrorBoundary message="Something went wrong loading the note form">
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
    rating,
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
  } = surfSpotDetails

  const isNoveltyWave = isWavepool || isRiverWave

  return (
    <div className="mb-l">
      <div className="content column">
        <div className="row space-between">
          <h1>{name}</h1>
          <div className="spot-actions">
            <ErrorBoundary message="Unable to display surf spot actions">
              <SurfSpotActions
                {...{
                  surfSpot: surfSpotDetails,
                  navigate,
                  user,
                  onFetcherSubmit,
                }}
              />
            </ErrorBoundary>
          </div>
        </div>
        <div className="row flex-end mb">
          <TextButton
            text={note ? "Show Notes" : "Add Notes"}
            onClick={handleOpenNotesDrawer}
            iconKey="clipboard"
          />
        </div>
        <p className="description">{description}</p>
        {!isNoveltyWave && (
          <div className="row spot-details gap mb pv">
            <Details label="Break Type" value={type} />
            <Details label="Beach Bottom" value={beachBottomType} />
            <Details label="Wave Direction" value={waveDirection} />
            <Details label="Skill Level" value={skillLevel} />
          </div>
        )}
      </div>
      <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
        <div className="map-wrapper mv">
          <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
        </div>
      </ErrorBoundary>
      <div className="content pt">
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
                      <a
                        key={forecast}
                        href={forecast}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {forecast}
                      </a>
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
              <a
                href={wavepoolUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wavepool-website-link"
              >
                {wavepoolUrl}
              </a>
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
        <section>
          <b>Overall Rating</b>
          <div className="row gap pt">
            <Rating value={rating} readOnly />
          </div>
        </section>
        <InfoMessage message="See something not right? Let us know so we can get it fixed" />
      </div>
    </div>
  )
}
