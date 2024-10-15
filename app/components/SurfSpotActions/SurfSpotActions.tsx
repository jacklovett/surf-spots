import { post, deleteData } from '~/services/networkService'
import TextButton from '../TextButton'

interface IProps {
  surfSpotId: string
  isSurfedSpot: boolean
  isWishlisted: boolean
}

export const SurfSpotActions = (props: IProps) => {
  const { surfSpotId, isSurfedSpot, isWishlisted } = props

  // TODO: Replace with actual userId from state/context
  const userId = 1

  const userSpotRequest = {
    userId,
    surfSpotId,
  }

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'wishlist',
  ) => {
    const endpoint =
      actionType === 'add' ? target : `${target}/${userId}/remove/${surfSpotId}`
    const requestMethod = actionType === 'add' ? post : deleteData

    try {
      await requestMethod(
        endpoint,
        actionType === 'add' ? userSpotRequest : undefined,
      )
    } catch (e) {
      console.error('Unable to perform action: ', e)
    }
  }

  return (
    <div className="actions">
      {!isWishlisted && !isSurfedSpot && (
        <TextButton
          text="Add to wishlist"
          onClick={() => handleAction('add', 'wishlist')}
          iconKey="heart"
        />
      )}
      {!isSurfedSpot && (
        <TextButton
          text="Add to surfed spots"
          onClick={() => handleAction('add', 'user-spots')}
          iconKey="plus"
        />
      )}
      {isSurfedSpot && (
        <TextButton
          text="Remove from surfed spots"
          onClick={() => handleAction('remove', 'user-spots')}
          iconKey="bin"
        />
      )}
      {isWishlisted && (
        <TextButton
          text="Remove from wishlist"
          onClick={() => handleAction('remove', 'wishlist')}
          iconKey="bin" // TODO: broke heart icon?
        />
      )}
    </div>
  )
}
