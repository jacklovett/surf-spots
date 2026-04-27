import type { SurfSpotActionMeta } from '~/types/api'

/**
 * User-facing success line for a completed watch-list or surfed-spots quick action.
 * Returns null when the payload does not match a known action (no toast).
 */
export const messageForSurfSpotActionSuccess = (
  action: SurfSpotActionMeta,
): string | null => {
  const { actionType, target } = action
  if (target === 'watch') {
    return actionType === 'add'
      ? 'Added to your watch list.'
      : 'Removed from your watch list.'
  }
  if (target === 'user-spots') {
    return actionType === 'add'
      ? 'Added to your surfed spots.'
      : 'Removed from your surfed spots.'
  }
  return null
}
