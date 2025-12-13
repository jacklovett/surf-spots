import { RefObject } from 'react'
import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router'
import { Page, TextButton, ContentStatus, Card } from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Surfboard } from '~/types/surfboard'
import { useScrollReveal } from '~/hooks'
import { formatLength, formatDimension } from '~/utils/surfboardUtils'

interface LoaderData {
  surfboards: Surfboard[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const surfboards = await get<Surfboard[]>(`surfboards?userId=${userId}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      { surfboards },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error: any) {
    console.error('Error fetching surfboards:', error)
    const errorMessage = `We couldn't load your surfboards right now. Please try again later.`

    return data<LoaderData>(
      {
        error: errorMessage,
        surfboards: [],
      },
      { status: 500 },
    )
  }
}

export default function Surfboards() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { state } = navigation

  const loaderData = useLoaderData<LoaderData>()
  const { surfboards, error } = loaderData || {}

  const surfboardsRef = useScrollReveal()

  const handleSurfboardClick = (surfboardId: string) =>
    navigate(`/surfboard/${surfboardId}`)

  // Page component automatically handles loading state

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  const surfboardsList = surfboards || []

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div className="surfboards-header">
          <h1>My Surfboards</h1>
          <TextButton
            text="Add Surfboard"
            onClick={() => navigate('/add-surfboard')}
            iconKey="plus"
            filled
          />
        </div>

        {surfboardsList.length === 0 ? (
          <div className="surfboards-empty">
            <p className="mv-l">No surfboards yet</p>
            <p className="text-secondary">
              Add your first surfboard to start tracking your collection
            </p>
          </div>
        ) : (
          <div className="surfboards-section">
            <div
              ref={surfboardsRef as RefObject<HTMLDivElement>}
              className="surfboards-grid"
            >
              {surfboardsList.map((surfboard) => (
                <Card
                  key={surfboard.id}
                  title={surfboard.name}
                  imageUrl={
                    surfboard.images?.[0]?.thumbUrl ||
                    surfboard.images?.[0]?.originalUrl
                  }
                  imageAlt={surfboard.name}
                  onClick={() => handleSurfboardClick(surfboard.id)}
                >
                  {surfboard.boardType && (
                    <p className="surfboard-type">{surfboard.boardType}</p>
                  )}
                  {surfboard.length && (
                    <p className="surfboard-dims">
                      {formatLength(surfboard.length)}
                      {surfboard.width &&
                        ` × ${formatDimension(surfboard.width)}"`}
                      {surfboard.thickness &&
                        ` × ${formatDimension(surfboard.thickness)}"`}
                    </p>
                  )}
                  {surfboard.volume && (
                    <p className="surfboard-volume">{surfboard.volume}L</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
