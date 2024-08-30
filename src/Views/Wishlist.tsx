import { Page } from '../Components'

const WishList = () => {
  const loading = false
  const error = null

  return (
    <Page
      showHeader
      content={
        <div className="column center">
          <p>WIP: WishList page</p>
        </div>
      }
      loading={loading}
      error={error}
    />
  )
}

export default WishList
