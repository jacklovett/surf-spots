import {
  data,
  LoaderFunction,
  ActionFunction,
  useNavigate,
  redirect,
} from 'react-router'
import { Page, SurfboardForm } from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { CreateSurfboardRequest, Surfboard } from '~/types/surfboard'
import { post } from '~/services/networkService'
import { useSubmitStatus } from '~/hooks'
import { messageForDisplay } from '~/utils/errorUtils'
import { parseLength, parseDimension } from '~/utils/surfboardUtils'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await requireSessionCookie(request)
    return data({})
  } catch (error) {
    return data(
      { error: 'You must be logged in to add surfboards' },
      { status: 401 },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data(
      {
        submitStatus: 'You must be logged in to add surfboards',
        hasError: true,
      },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const name = (formData.get('name') as string)?.trim()

  if (!name || name.length === 0) {
    return data(
      {
        submitStatus: 'Name is required',
        hasError: true,
      },
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

  const surfboardData: CreateSurfboardRequest = {
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
    modelUrl: (formData.get('modelUrl') as string)?.trim() || undefined,
  }

  try {
    const cookie = request.headers.get('Cookie') || ''
    const surfboard = await post<CreateSurfboardRequest, Surfboard>(
      `surfboards?userId=${user.id}`,
      surfboardData,
      { headers: { Cookie: cookie } },
    )

    return redirect(`/surfboard/${surfboard.id}`)
  } catch (error) {
    console.error('Error creating surfboard:', error)
    const networkError = error as { status?: number; message?: string }
    const errorMessage = messageForDisplay(
      networkError?.message,
      'Failed to create surfboard. Please try again.',
    )
    return data(
      {
        submitStatus: errorMessage,
        hasError: true,
      },
      { status: networkError?.status || 500 },
    )
  }
}

export default function AddSurfboard() {
  const navigate = useNavigate()
  const submitStatus = useSubmitStatus()

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <h1>Add Surfboard</h1>
        <SurfboardForm
          actionType="Add"
          submitStatus={submitStatus}
          onCancel={() => navigate('/surfboards')}
        />
      </div>
    </Page>
  )
}
