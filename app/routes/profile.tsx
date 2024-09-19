import { useNavigate } from '@remix-run/react'
import { ContentStatus, Button, Page } from '~/components'

const Profile = () => {
  const navigate = useNavigate()

  const user = undefined
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
          <Button label="Back" onClick={() => navigate('/surf-spots')} />
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
