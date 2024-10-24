import { MetaFunction, useNavigate } from '@remix-run/react'
import { useUser } from '~/contexts/UserContext'
import { ContentStatus, Button, Page } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Profile' },
    { name: 'description', content: 'User profile page' },
  ]
}

const Profile = () => {
  const navigate = useNavigate()

  const { user } = useUser()

  const error = null

  const renderContent = () => {
    if (!user) {
      return (
        <ContentStatus isError>
          <p>No user profile data found</p>
        </ContentStatus>
      )
    }

    const { country, email, name, region } = user

    return (
      <div className="column center-vertical mt">
        <h3>Profile</h3>
        <p>{`Name: ${name}`}</p>
        <p>{`Email: ${email}`}</p>
        {country && region && <p>{`Location: ${region} / ${country}`}</p>}
        <div className="center mt">
          <Button label="Back" onClick={() => navigate(-1)} />
        </div>
      </div>
    )
  }

  return (
    <Page showHeader error={error}>
      {renderContent()}
    </Page>
  )
}

export default Profile
