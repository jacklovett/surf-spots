import { Page } from '../Components'

const Profile = () => {
  const loading = false
  const error = null

  return (
    <Page
      showHeader
      content={
        <div className="column center">
          <p>WIP: Profile page</p>
        </div>
      }
      loading={loading}
      error={error}
    />
  )
}

export default Profile
