import { describe, expect, it } from 'vitest'

import { SkillLevel, type SurfSessionListItem } from '~/types/surfSpots'

import {
  buildAddSurfSpotPathForUnassignedSession,
  liveSessionHasSavedEndDetails,
  parseAddSpotSessionLinkParams,
  parseSubmittedSkillLevel,
  sessionHasRecordedLiveStartLocation,
} from './surfSessionFormUtils'

const sessionStub = (
  overrides: Partial<SurfSessionListItem> = {},
): SurfSessionListItem =>
  ({
    id: 42,
    ...overrides,
  }) as SurfSessionListItem

describe('sessionHasRecordedLiveStartLocation', () => {
  it('should require both start coordinates', () => {
    expect(sessionHasRecordedLiveStartLocation(null)).toBe(false)
    expect(
      sessionHasRecordedLiveStartLocation(
        sessionStub({ startLatitude: 38.7, startLongitude: undefined }),
      ),
    ).toBe(false)
    expect(
      sessionHasRecordedLiveStartLocation(
        sessionStub({ startLatitude: 38.7, startLongitude: -9.1 }),
      ),
    ).toBe(true)
  })
})

describe('liveSessionHasSavedEndDetails', () => {
  it('should be false when no end-detail fields are set', () => {
    expect(liveSessionHasSavedEndDetails(sessionStub())).toBe(false)
  })

  it('should be true when any end-detail field is present', () => {
    expect(
      liveSessionHasSavedEndDetails(sessionStub({ waveSize: 'Head high' })),
    ).toBe(true)
    expect(
      liveSessionHasSavedEndDetails(sessionStub({ sessionRating: 4 })),
    ).toBe(true)
    expect(
      liveSessionHasSavedEndDetails(sessionStub({ sessionNotes: 'glassy' })),
    ).toBe(true)
  })
})

describe('parseSubmittedSkillLevel', () => {
  it('should accept known skill levels and reject unknown values', () => {
    expect(parseSubmittedSkillLevel(SkillLevel.INTERMEDIATE)).toBe(
      SkillLevel.INTERMEDIATE,
    )
    expect(parseSubmittedSkillLevel('  Advanced  ')).toBe(SkillLevel.ADVANCED)
    expect(parseSubmittedSkillLevel('')).toBeUndefined()
    expect(parseSubmittedSkillLevel('not-a-level')).toBeUndefined()
    expect(parseSubmittedSkillLevel(null)).toBeUndefined()
  })
})

describe('buildAddSurfSpotPathForUnassignedSession', () => {
  it('should return null without coordinates', () => {
    expect(
      buildAddSurfSpotPathForUnassignedSession(
        sessionStub({ startLatitude: null, startLongitude: null }),
      ),
    ).toBeNull()
  })

  it('should build add-spot path with lat, lng, and session id', () => {
    const path = buildAddSurfSpotPathForUnassignedSession(
      sessionStub({
        id: 7,
        startLatitude: 38.64298,
        startLongitude: -9.23984,
      }),
    )
    expect(path).toBe(
      '/add-surf-spot?latitude=38.64298&longitude=-9.23984&sessionId=7',
    )
  })
})

describe('parseAddSpotSessionLinkParams', () => {
  it('should return null when coordinates are missing or invalid', () => {
    expect(parseAddSpotSessionLinkParams(new FormData())).toBeNull()

    const badCoords = new FormData()
    badCoords.set('linkSessionLatitude', 'nope')
    badCoords.set('linkSessionLongitude', '-9.1')
    expect(parseAddSpotSessionLinkParams(badCoords)).toBeNull()
  })

  it('should parse coords and optional session id', () => {
    const formData = new FormData()
    formData.set('linkSessionLatitude', '38.7')
    formData.set('linkSessionLongitude', '-9.1')
    formData.set('linkSessionId', '99')

    expect(parseAddSpotSessionLinkParams(formData)).toEqual({
      sessionId: 99,
      anchorLatitude: 38.7,
      anchorLongitude: -9.1,
    })
  })
})
