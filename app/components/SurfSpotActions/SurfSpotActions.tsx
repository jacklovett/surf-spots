import { post, deleteData } from '~/services/networkService'
import { TextButton } from '../index'
import { SurfSpot } from '~/types/surfSpots'

interface IProps {
  surfSpot: SurfSpot
}

export const SurfSpotActions = (props: IProps) => {
  const { surfSpot } = props
  const { id, isSurfedSpot, isWishlisted } = surfSpot

  // TODO: Replace with actual userId from state/context
  const userId = 1

  const userSpotRequest = {
    userId,
    surfSpotId: id,
  }

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'wishlist',
  ) => {
    const endpoint =
      actionType === 'add' ? target : `${target}/${userId}/remove/${id}`
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
          filled
        />
      )}
      {!isSurfedSpot && (
        <TextButton
          text="Add to surfed spots"
          onClick={() => handleAction('add', 'user-spots')}
          iconKey="plus"
          filled
        />
      )}
      {isSurfedSpot && (
        <TextButton
          text="Remove from surfed spots"
          onClick={() => handleAction('remove', 'user-spots')}
          iconKey="bin"
          filled
        />
      )}
      {isWishlisted && (
        <TextButton
          text="Remove from wishlist"
          onClick={() => handleAction('remove', 'wishlist')}
          iconKey="bin"
          filled
        />
      )}
    </div>
  )
}
