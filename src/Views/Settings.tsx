import { Page } from '../Components'

const Settings = () => {
  const loading = false
  const error = null

  return (
    <Page
      showHeader
      content={
        <div className="column center">
          <p>WIP: Settings page</p>
        </div>
      }
      loading={loading}
      error={error}
    />
  )
}

export default Settings
