import {
  ActionFunction,
  data,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router'

import {
  cacheControlHeader,
  get,
  getDisplayMessage,
} from '~/services/networkService'
import { requireFullUserProfile } from '~/services/session.server'
import { handleSaveSurfSession } from '~/services/surfSpot.server'
import { SurfSpot } from '~/types/surfSpots'
import { Surfboard } from '~/types/surfboard'
import { ActionData } from '~/types/api'
import { ErrorBoundary, SurfSessionForm } from '~/components'
import {
  ERROR_BOUNDARY_GENERIC,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_SAVE_SURF_SESSION,
  ERROR_SESSION_SKILL_LEVEL_REQUIRED,
} from '~/utils/errorUtils'

interface LoaderData {
  surfSpotDetails?: SurfSpot
  surfboards: Surfboard[]
  requiresSkillLevel: boolean
  error?: string
}

const loadSurfboardsForUser = async (
  cookie: string,
): Promise<Surfboard[]> => {
  try {
    return await get<Surfboard[]>(`surfboards`, {
      headers: { Cookie: cookie },
    })
  } catch {
    return []
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireFullUserProfile(request)
  const { surfSpot: surfSpotSlug, country: countrySlug, region: regionSlug } =
    params

  if (!surfSpotSlug) {
    return data<LoaderData>(
      { error: 'Surf spot is required', surfboards: [], requiresSkillLevel: false },
      { status: 400 },
    )
  }

  try {
    const queryParams = new URLSearchParams()
    if (countrySlug) queryParams.set('countrySlug', countrySlug)
    if (regionSlug) queryParams.set('regionSlug', regionSlug)
    const queryString = queryParams.toString()
    const baseUrl = `surf-spots/${encodeURIComponent(surfSpotSlug)}`
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

    const cookie = request.headers.get('Cookie') || ''
    const [surfSpotDetails, surfboards] = await Promise.all([
      get<SurfSpot>(url, { headers: { Cookie: cookie } }),
      loadSurfboardsForUser(cookie),
    ])

    return data<LoaderData>(
      { surfSpotDetails, surfboards, requiresSkillLevel: !user.skillLevel },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Add session page: failed to load surf spot', error)
    return data<LoaderData>(
      {
        surfboards: [],
        requiresSkillLevel: false,
        error: `We can't load this surf spot right now. Please try again later.`,
      },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const intent = formData.get('intent') as string
  if (intent !== 'saveSurfSession') {
    return data<ActionData>(
      { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
      { status: 400 },
    )
  }
  try {
    const user = await requireFullUserProfile(request)
    const cookie = request.headers.get('Cookie') || ''
    const submittedSkillLevel = formData.get('skillLevel')
    const skillLevel =
      user.skillLevel ??
      (typeof submittedSkillLevel === 'string' ? submittedSkillLevel : undefined)

    if (!skillLevel) {
      return data<ActionData>(
        {
          submitStatus: ERROR_SESSION_SKILL_LEVEL_REQUIRED,
          hasError: true,
        },
        { status: 400 },
      )
    }

    formData.set('skillLevel', skillLevel)
    return await handleSaveSurfSession(formData, cookie)
  } catch (error) {
    console.error('Add session action failed', error)
    if (error instanceof Response) return error
    return data<ActionData>(
      {
        submitStatus: getDisplayMessage(error, ERROR_SAVE_SURF_SESSION),
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function SurfSpotAddSessionRoute() {
  const { surfSpotDetails, surfboards, requiresSkillLevel, error } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const location = useLocation()
  const fetcher = useFetcher<ActionData>()

  const formActionPath = location.pathname

  if (error || surfSpotDetails == null || surfSpotDetails.id == null) {
    return (
      <div className="mb-l">
        <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
          <p className="ph">
            {error ||
              'We could not open this session for the spot. Try again from the surf spot page.'}
          </p>
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <div className="mb-l">
      <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
        <SurfSessionForm
          surfSpotId={String(surfSpotDetails.id)}
          surfSpotName={surfSpotDetails.name ?? ''}
          formActionPath={formActionPath}
          fetcher={fetcher}
          surfboards={surfboards}
          requiresSkillLevel={requiresSkillLevel}
          onCancel={() => navigate(surfSpotDetails.path)}
        />
      </ErrorBoundary>
    </div>
  )
}

