import { post, deleteData } from '~/services/networkService'
import { TextButton } from '../index'
import { SurfSpot } from '~/types/surfSpots'

interface IProps {
  surfSpot: SurfSpot
}

export const SurfSpotActions = (props: IProps) => {
  const { surfSpot } = props
  const { id, isSurfedSpot, isWatching } = surfSpot

  // TODO: Replace with actual userId from state/context
  const userId = 1

  const userSpotRequest = {
    userId,
    surfSpotId: id,
  }

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'watch',
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
      {!isWatching && !isSurfedSpot && (
        <TextButton
          text="Add to watch list"
          onClick={() => handleAction('add', 'watch')}
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
      {isWatching && (
        <TextButton
          text="Remove from watch list"
          onClick={() => handleAction('remove', 'watch')}
          iconKey="bin"
          filled
        />
      )}
    </div>
  )
}
