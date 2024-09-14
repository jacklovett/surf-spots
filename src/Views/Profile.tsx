import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button, ContentStatus, Page } from '../Components'

import { AppDispatch } from '../Store'
import { selectUser, selectUserError, selectUserLoading } from '../Store/user'
import { fetchUserProfile } from '../Services/userService'

const Profile = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector(selectUser)
  const loading = useSelector(selectUserLoading)
  const error = useSelector(selectUserError)

  useEffect(() => {
    dispatch(fetchUserProfile()).catch(console.error)
  }, [dispatch])

  const renderContent = () => {
    if (!user) {
      return <ContentStatus content="No user profile data found" isError />
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
    <Page
      showHeader
      content={renderContent()}
      loading={loading}
      error={error}
    />
  )
}

export default Profile
