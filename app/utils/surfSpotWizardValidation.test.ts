import { describe, expect, it } from 'vitest'

import { SurfSpotStatus } from '~/types/surfSpots'

import {
  getStepRequiredFields,
  isPublicSurfSpotPayloadComplete,
} from './surfSpotWizardValidation'

const publicContext = {
  isPrivateSpot: false,
  isWavepool: false,
  isNoveltyWave: false,
}

describe('getStepRequiredFields', () => {
  it('should require description for public basics but not private', () => {
    expect(getStepRequiredFields('basics', publicContext)).toEqual([
      'name',
      'description',
    ])
    expect(
      getStepRequiredFields('basics', {
        ...publicContext,
        isPrivateSpot: true,
      }),
    ).toEqual(['name'])
  })

  it('should require wavepoolUrl for public wavepools on spot-type', () => {
    expect(
      getStepRequiredFields('spot-type', {
        ...publicContext,
        isWavepool: true,
      }),
    ).toContain('wavepoolUrl')
    expect(getStepRequiredFields('spot-type', publicContext)).not.toContain(
      'wavepoolUrl',
    )
  })

  it('should skip condition fields for novelty waves on details', () => {
    expect(
      getStepRequiredFields('details', {
        ...publicContext,
        isNoveltyWave: true,
      }),
    ).toEqual([])
    expect(getStepRequiredFields('details', publicContext)).toEqual([
      'swellDirection',
      'windDirection',
      'tide',
    ])
  })
})

describe('isPublicSurfSpotPayloadComplete', () => {
  const completeOcean = {
    status: SurfSpotStatus.PENDING,
    description: 'Fun beach break',
    isWavepool: false,
    isRiverWave: false,
    type: 'Beach',
    beachBottomType: 'Sand',
    skillLevel: 'Intermediate',
    waveDirection: 'Left',
    swellDirection: 'NW-N',
    windDirection: 'E',
    tide: 'Mid',
  }

  it('should treat private spots as complete', () => {
    expect(
      isPublicSurfSpotPayloadComplete({
        ...completeOcean,
        status: SurfSpotStatus.PRIVATE,
        description: '',
      }),
    ).toBe(true)
  })

  it('should require core fields for public ocean spots', () => {
    expect(isPublicSurfSpotPayloadComplete(completeOcean)).toBe(true)
    expect(
      isPublicSurfSpotPayloadComplete({
        ...completeOcean,
        swellDirection: '',
      }),
    ).toBe(false)
  })

  it('should reject wavepool + river together and require wavepool URL', () => {
    expect(
      isPublicSurfSpotPayloadComplete({
        ...completeOcean,
        isWavepool: true,
        isRiverWave: true,
      }),
    ).toBe(false)
    expect(
      isPublicSurfSpotPayloadComplete({
        ...completeOcean,
        isWavepool: true,
        swellDirection: '',
        windDirection: '',
        tide: '',
        wavepoolUrl: '',
      }),
    ).toBe(false)
    expect(
      isPublicSurfSpotPayloadComplete({
        ...completeOcean,
        isWavepool: true,
        swellDirection: '',
        windDirection: '',
        tide: '',
        wavepoolUrl: 'https://pool.example',
      }),
    ).toBe(true)
  })
})
