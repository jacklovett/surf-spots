import { describe, expect, it } from 'vitest'

import {
  SESSION_TIMING_END_BEFORE_START,
  SESSION_TIMING_END_REQUIRES_START,
  SESSION_TIMING_INVALID_END_TIME,
  SESSION_TIMING_INVALID_START_TIME,
} from './errorUtils'
import {
  isSurfSessionTimingBannerMessage,
  validateSurfSessionTimeWindow,
} from './surfSessionTimingValidation'

describe('validateSurfSessionTimeWindow', () => {
  it('should allow both times empty', () => {
    expect(validateSurfSessionTimeWindow('', '')).toBeNull()
    expect(validateSurfSessionTimeWindow('  ', '  ')).toBeNull()
  })

  it('should allow start without end', () => {
    expect(validateSurfSessionTimeWindow('09:00', '')).toBeNull()
  })

  it('should require start when end is set', () => {
    expect(validateSurfSessionTimeWindow('', '10:00')).toBe(
      SESSION_TIMING_END_REQUIRES_START,
    )
  })

  it('should reject invalid start or end clock values', () => {
    expect(validateSurfSessionTimeWindow('25:00', '10:00')).toBe(
      SESSION_TIMING_INVALID_START_TIME,
    )
    expect(validateSurfSessionTimeWindow('09:00', '99:99')).toBe(
      SESSION_TIMING_INVALID_END_TIME,
    )
  })

  it('should reject end at or before start', () => {
    expect(validateSurfSessionTimeWindow('10:00', '10:00')).toBe(
      SESSION_TIMING_END_BEFORE_START,
    )
    expect(validateSurfSessionTimeWindow('11:00', '10:00')).toBe(
      SESSION_TIMING_END_BEFORE_START,
    )
  })

  it('should accept a valid same-day window', () => {
    expect(validateSurfSessionTimeWindow('09:15', '10:42')).toBeNull()
  })
})

describe('isSurfSessionTimingBannerMessage', () => {
  it('should recognize known timing messages', () => {
    expect(
      isSurfSessionTimingBannerMessage(SESSION_TIMING_END_REQUIRES_START),
    ).toBe(true)
    expect(isSurfSessionTimingBannerMessage('Something else')).toBe(false)
  })
})
