import {
  json,
  MetaFunction,
  useLoaderData,
  useNavigate,
} from '@remix-run/react'
import { ContentStatus, Button, Page } from '~/components'
import { get } from '~/services/networkService'
import { UserProfile } from '~/types/user'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Profile' },
    { name: 'description', content: 'User profile page' },
  ]
}

interface LoaderData {
  user?: UserProfile
}

export const loader = async (params: { userId: string }) => {
  // const { userId } = params // TODO: Can we get this from state instead ??
  const userId = 1
  const user = await get<UserProfile>(`users/${userId}/profile`)
  return json<LoaderData>({ user })
}

const Profile = () => {
  const navigate = useNavigate()

  const { user } = useLoaderData<LoaderData>()

  const loading = false
  const error = null

  const renderContent = () => {
    if (!user) {
      return (
        <ContentStatus isError>
          <p>No user profile data found</p>
        </ContentStatus>
      )
    }

    const { country, email, name, region, username } = user

    return (
      <div className="column center-vertical">
        <h3>Profile</h3>
        <p>{`Name: ${name}`}</p>
        <p>{`Email: ${email}`}</p>
        <p>{`Username: ${username}`}</p>
        <p>{`Location: ${region} / ${country}`}</p>
        <div className="center">
          <Button label="Back" onClick={() => navigate(-1)} />
        </div>
      </div>
    )
  }

  return (
    <Page showHeader loading={loading} error={error}>
      {renderContent()}
    </Page>
  )
}

export default Profile
