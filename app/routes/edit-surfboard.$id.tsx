import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate,
  redirect,
} from 'react-router'
import {
  ErrorBoundary,
  ContentStatus,
  Page,
  SurfboardForm,
} from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { updateSurfboard } from '~/services/surfboard'
import { Surfboard, UpdateSurfboardRequest } from '~/types/surfboard'
import { cacheControlHeader, get } from '~/services/networkService'
import { parseLength, parseDimension } from '~/utils/surfboardUtils'
import { useSubmitStatus } from '~/hooks'
import { ActionData } from '~/types/api'
import {
  ERROR_METHOD_NOT_ALLOWED,
  ERROR_NAME_REQUIRED,
  ERROR_SURFBOARD_NOT_FOUND,
  ERROR_UPDATE_SURFBOARD,
  ERROR_BOUNDARY_SECTION,
  ERROR_LOAD_SURFBOARDS,
} from '~/utils/errorUtils'
import { normalizeUserUrl } from '~/utils/commonUtils'

interface LoaderData {
  surfboard: Surfboard
  error?: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireSessionCookie(request)
  const surfboardId = params.id

  if (!surfboardId) {
    return data<LoaderData>(
      { error: ERROR_SURFBOARD_NOT_FOUND, surfboard: {} as Surfboard },
      { status: 404 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const surfboard = await get<Surfboard>(
      `surfboards/${surfboardId}`,
      {
        headers: { Cookie: cookie },
      },
    )

    return data<LoaderData>(
      { surfboard },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surfboard:', error)
    return data<LoaderData>(
      {
        error: ERROR_LOAD_SURFBOARDS,
        surfboard: {} as Surfboard,
      },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ params, request }) => {
  // Only handle PUT requests for updates
  if (request.method !== 'PUT') {
    return data<ActionData>(
      { submitStatus: ERROR_METHOD_NOT_ALLOWED, hasError: true },
      { status: 405 },
    )
  }

  await requireSessionCookie(request)
  const { id: surfboardId } = params

  if (!surfboardId) {
    return data<ActionData>(
      { submitStatus: ERROR_SURFBOARD_NOT_FOUND, hasError: true },
      { status: 404 },
    )
  }

  const formData = await request.formData()
  const name = (formData.get('name') as string)?.trim()

  if (!name || name.length === 0) {
    return data<ActionData>(
      { submitStatus: ERROR_NAME_REQUIRED, hasError: true },
      { status: 400 },
    )
  }

  const boardType = (formData.get('boardType') as string)?.trim() || undefined
  // Parse dimensions using surfboard format utilities
  const length = parseLength((formData.get('length') as string)?.trim() || '')
  const width = parseDimension((formData.get('width') as string)?.trim() || '')
  const thickness = parseDimension(
    (formData.get('thickness') as string)?.trim() || '',
  )

  const surfboardData: UpdateSurfboardRequest = {
    name,
    boardType,
    length,
    width,
    thickness,
    volume: formData.get('volume')
      ? parseFloat(formData.get('volume') as string)
      : undefined,
    finSetup: (formData.get('finSetup') as string)?.trim() || undefined,
    description: (formData.get('description') as string)?.trim() || undefined,
    modelUrl:
      normalizeUserUrl((formData.get('modelUrl') as string) || '') || undefined,
  }

  try {
    const cookie = request.headers.get('Cookie') || ''
    await updateSurfboard(surfboardId, surfboardData, {
      headers: { Cookie: cookie },
    })

    return redirect(`/surfboard/${surfboardId}?success`)
  } catch (error) {
    console.error('Failed to update surfboard:', error)
    return data<ActionData>(
      {
        submitStatus: ERROR_UPDATE_SURFBOARD,
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function EditSurfboard() {
  const { surfboard, error } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const submitStatus = useSubmitStatus()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <div className="info-page-content mv">
          <h1>Edit Surfboard</h1>
          <SurfboardForm
            actionType="Edit"
            surfboard={surfboard}
            submitStatus={submitStatus}
            onCancel={() =>
              navigate(`/surfboard/${surfboard.id}`, { replace: true })
            }
          />
        </div>
      </ErrorBoundary>
    </Page>
  )
}

