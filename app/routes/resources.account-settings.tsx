import { data, LoaderFunction } from 'react-router'

import { privateCacheControlHeader } from '~/services/networkService'
import { requireFullUserProfile } from '~/services/session.server'
import type { UserSettings } from '~/types/user'

interface LoaderData {
  settings: UserSettings | null
}

/**
 * Lightweight account settings for client contexts (nearby-email opt-in, units).
 * Prefer this over loading the full /settings page shell.
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const profile = await requireFullUserProfile(request)
    return data<LoaderData>(
      { settings: profile.settings ?? null },
      { headers: privateCacheControlHeader },
    )
  } catch {
    return data<LoaderData>(
      { settings: null },
      { headers: privateCacheControlHeader },
    )
  }
}
