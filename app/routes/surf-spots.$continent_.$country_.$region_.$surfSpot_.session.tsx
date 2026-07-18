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
import {
  requireFullUserProfile,
  requireSessionCookie,
} from '~/services/session.server'
import { handleSaveSurfSession } from '~/services/surfSpot.server'
import { SurfSpot } from '~/types/surfSpots'
import { Surfboard } from '~/types/surfboard'
import { ActionData } from '~/types/api'
import { ErrorBoundary, SurfSessionForm } from '~/components'
import {
  ERROR_ADD_SESSION_PAGE_CONTEXT,
  ERROR_BOUNDARY_GENERIC,
  ERROR_LOAD_SURF_SPOT_FOR_ADD_SESSION,
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_SAVE_SURF_SESSION,
  ERROR_SURF_SPOT_SLUG_REQUIRED,
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
    const surfboardsResponse = await get<Surfboard[]>(`surfboards`, {
      headers: { Cookie: cookie },
    })
    return surfboardsResponse?.data ?? []
  } catch {
    return []
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireSessionCookie(request)
  const { surfSpot: surfSpotSlug, country: countrySlug, region: regionSlug } =
    params

  if (!surfSpotSlug) {
    return data<LoaderData>(
      { error: ERROR_SURF_SPOT_SLUG_REQUIRED, surfboards: [], requiresSkillLevel: false },
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
      get<SurfSpot>(url, { headers: { Cookie: cookie } }).then((response) => {
        const surfSpotDetails = response?.data
        return surfSpotDetails
      }),
      loadSurfboardsForUser(cookie),
    ])

    return data<LoaderData>(
      { surfSpotDetails, surfboards, requiresSkillLevel: false },
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
        error: ERROR_LOAD_SURF_SPOT_FOR_ADD_SESSION,
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
      (typeof submittedSkillLevel === 'string' && submittedSkillLevel.trim() !== ''
        ? submittedSkillLevel.trim()
        : undefined)

    if (skillLevel != null) {
      formData.set('skillLevel', skillLevel)
    }
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
            {error || ERROR_ADD_SESSION_PAGE_CONTEXT}
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

