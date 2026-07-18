import { describe, expect, it } from 'vitest'

import {
  SUCCESS_SURF_SPOT_ADDED,
  surfSpotAddedSuccessMessage,
} from './errorUtils'

describe('surfSpotAddedSuccessMessage', () => {
  it('should return base message when link message is missing', () => {
    expect(surfSpotAddedSuccessMessage(undefined)).toBe(SUCCESS_SURF_SPOT_ADDED)
    expect(surfSpotAddedSuccessMessage(null)).toBe(SUCCESS_SURF_SPOT_ADDED)
    expect(surfSpotAddedSuccessMessage('')).toBe(SUCCESS_SURF_SPOT_ADDED)
    expect(surfSpotAddedSuccessMessage('   ')).toBe(SUCCESS_SURF_SPOT_ADDED)
  })

  it('should append the API link message when present', () => {
    expect(surfSpotAddedSuccessMessage('2 past sessions linked to this spot')).toBe(
      `${SUCCESS_SURF_SPOT_ADDED}. 2 past sessions linked to this spot`,
    )
  })
})
