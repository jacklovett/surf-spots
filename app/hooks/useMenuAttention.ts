import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { useUserContext } from '~/contexts'
import {
  hasUnseenIds,
  menuAttentionKeyForPath,
  menuAttentionSources,
  readSeenIds,
  subscribeMenuAttention,
  writeSeenIds,
} from '~/utils/menuAttention'

const sameIdSet = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false
  }
  const rightSet = new Set(right)
  return left.every((id) => rightSet.has(id))
}

export const useMenuAttention = () => {
  const { user } = useUserContext()
  const location = useLocation()
  const [idsByKey, setIdsByKey] = useState<Record<string, string[]>>({})
  const [revision, setRevision] = useState(0)

  const loadIds = useCallback(async () => {
    if (!user?.id) {
      setIdsByKey({})
      return
    }
    const nextIds: Record<string, string[]> = {}
    await Promise.all(
      menuAttentionSources.map(async (source) => {
        nextIds[source.key] = await source.getCurrentIds()
      }),
    )
    setIdsByKey((previous) => {
      const unchanged = menuAttentionSources.every((source) =>
        sameIdSet(previous[source.key] ?? [], nextIds[source.key] ?? []),
      )
      return unchanged ? previous : nextIds
    })
  }, [user?.id])

  useEffect(() => {
    void loadIds()
  }, [loadIds])

  useEffect(
    () =>
      subscribeMenuAttention(() => {
        setRevision((previous) => previous + 1)
        void loadIds()
      }),
    [loadIds],
  )

  const markSeen = useCallback(
    (menuKey: string) => {
      if (!user?.id) {
        return
      }
      if (!menuAttentionSources.some((source) => source.key === menuKey)) {
        return
      }
      writeSeenIds(user.id, menuKey, idsByKey[menuKey] ?? [])
    },
    [user?.id, idsByKey],
  )

  // Clear attention when the user visits a registered menu path.
  useEffect(() => {
    if (!user?.id) {
      return
    }
    const menuKey = menuAttentionKeyForPath(location.pathname)
    if (!menuKey || !(menuKey in idsByKey)) {
      return
    }
    const currentIds = idsByKey[menuKey] ?? []
    if (sameIdSet(currentIds, readSeenIds(user.id, menuKey))) {
      return
    }
    writeSeenIds(user.id, menuKey, currentIds)
  }, [location.pathname, user?.id, idsByKey])

  const hasAttention = useCallback(
    (menuKey: string): boolean => {
      if (!user?.id) {
        return false
      }
      // revision re-reads localStorage after writes from any hook instance
      void revision
      const currentIds = idsByKey[menuKey] ?? []
      return hasUnseenIds(currentIds, readSeenIds(user.id, menuKey))
    },
    [user?.id, idsByKey, revision],
  )

  const hasAny = menuAttentionSources.some((source) =>
    hasAttention(source.key),
  )

  return { hasAttention, hasAny, markSeen }
}
