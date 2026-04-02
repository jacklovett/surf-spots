import { roundCoordinate } from '~/utils/coordinateUtils'

/**
 * Payload shape for building FormData for add/edit surf spot.
 * Keeps the form → server contract in one place so the component doesn't manually append every key.
 */
export interface SurfSpotFormSubmitPayload {
  formState: {
    name?: string
    description?: string
    region?: string
    longitude?: number
    latitude?: number
    type?: string
    beachBottomType?: string
    swellDirection?: string
    windDirection?: string
    tide?: string
    waveDirection?: string
    skillLevel?: string
    crowdLevel?: string
    minSurfHeight?: number | string
    maxSurfHeight?: number | string
    parking?: string
    forecastLinks?: { url: string }[]
    webcamLinks?: { url: string }[]
  }
  isPrivateSpot: boolean
  foodNearby: boolean
  accommodationNearby: boolean
  isBoatRequired: boolean
  isWavepool: boolean
  wavepoolUrl: string
  isRiverWave: boolean
  foodOptions: { value: string }[]
  accommodationOptions: { value: string }[]
  facilities: { value: string }[]
  hazards: { value: string }[]
}

export const buildSurfSpotFormData = (
  payload: SurfSpotFormSubmitPayload,
): FormData => {
  const {
    formState,
    isPrivateSpot,
    foodNearby,
    accommodationNearby,
    isBoatRequired,
    isWavepool,
    wavepoolUrl,
    isRiverWave,
    foodOptions,
    accommodationOptions,
    facilities,
    hazards,
  } = payload
  const fd = new FormData()
  fd.append('name', formState.name ?? '')
  fd.append('description', formState.description ?? '')
  fd.append('region', formState.region ?? '')
  fd.append(
    'longitude',
    String(
      formState.longitude != null ? roundCoordinate(formState.longitude) : '',
    ),
  )
  fd.append(
    'latitude',
    String(
      formState.latitude != null ? roundCoordinate(formState.latitude) : '',
    ),
  )
  fd.append('type', formState.type ?? '')
  fd.append('beachBottomType', formState.beachBottomType ?? '')
  fd.append('swellDirection', formState.swellDirection ?? '')
  fd.append('windDirection', formState.windDirection ?? '')
  fd.append('tide', formState.tide ?? '')
  fd.append('waveDirection', formState.waveDirection ?? '')
  fd.append('skillLevel', formState.skillLevel ?? '')
  fd.append('crowdLevel', formState.crowdLevel ?? '')
  fd.append('minSurfHeight', String(formState.minSurfHeight ?? ''))
  fd.append('maxSurfHeight', String(formState.maxSurfHeight ?? ''))
  fd.append('parking', formState.parking ?? '')
  if (isPrivateSpot) fd.append('isPrivate', 'on')
  if (foodNearby) fd.append('foodNearby', 'on')
  if (accommodationNearby) fd.append('accommodationNearby', 'on')
  if (isBoatRequired) fd.append('boatRequired', 'on')
  if (isWavepool) fd.append('isWavepool', 'on')
  if (isWavepool && wavepoolUrl) fd.append('wavepoolUrl', wavepoolUrl)
  if (isRiverWave) fd.append('isRiverWave', 'on')
  if (!isWavepool) {
    ;(formState.forecastLinks ?? []).forEach((link) =>
      fd.append('forecasts', link.url),
    )
  }
  ;(formState.webcamLinks ?? []).forEach((link) => fd.append('webcams', link.url))
  foodOptions.forEach((opt) => fd.append('foodOptions', opt.value))
  accommodationOptions.forEach((opt) =>
    fd.append('accommodationOptions', opt.value),
  )
  facilities.forEach((opt) => fd.append('facilities', opt.value))
  hazards.forEach((opt) => fd.append('hazards', opt.value))
  return fd
}
