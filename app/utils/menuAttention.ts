import { get } from '~/services/networkService'
import type { WatchedSurfSpotsSummary } from '~/types/watchedSurfSpotsSummary'

export type MenuAttentionSource = {
  key: string
  path: string
  getCurrentIds: () => Promise<string[]>
}

const STORAGE_PREFIX = 'menu-attention:'

export const menuAttentionStorageKey = (userId: string, menuKey: string): string =>
  `${STORAGE_PREFIX}${userId}:${menuKey}`

export const hasUnseenIds = (
  currentIds: string[],
  seenIds: string[],
): boolean => {
  if (currentIds.length === 0) {
    return false
  }
  const seen = new Set(seenIds)
  return currentIds.some((id) => !seen.has(id))
}

export const readSeenIds = (userId: string, menuKey: string): string[] => {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(
      menuAttentionStorageKey(userId, menuKey),
    )
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

const listeners = new Set<() => void>()

export const subscribeMenuAttention = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const notifyMenuAttentionChanged = () => {
  listeners.forEach((listener) => listener())
}

export const writeSeenIds = (
  userId: string,
  menuKey: string,
  ids: string[],
): void => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(
    menuAttentionStorageKey(userId, menuKey),
    JSON.stringify(ids),
  )
  notifyMenuAttentionChanged()
}

let watchListIdsCache: Promise<string[]> | null = null

const fetchWatchListNotificationIds = async (): Promise<string[]> => {
  try {
    const result = await get<WatchedSurfSpotsSummary>('watch')
    const notifications = result.data?.notifications ?? []
    return notifications
      .map((notification) => notification.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  } catch {
    return []
  }
}

/** Session-cached watch-list notification ids (one fetch per page load). */
export const getWatchListNotificationIds = (): Promise<string[]> => {
  if (!watchListIdsCache) {
    watchListIdsCache = fetchWatchListNotificationIds()
  }
  return watchListIdsCache
}

export const menuAttentionSources: MenuAttentionSource[] = [
  {
    key: 'watch-list',
    path: '/watch-list',
    getCurrentIds: getWatchListNotificationIds,
  },
]

export const menuAttentionKeyForPath = (path: string): string | undefined =>
  menuAttentionSources.find((source) => source.path === path)?.key
