import { SkillLevel, SurfSessionListItem } from '~/types/surfSpots'

/** Live sessions store GPS at start; spot assignment is chosen separately on the map. */
export const sessionHasRecordedLiveStartLocation = (
  session?: Pick<SurfSessionListItem, 'startLatitude' | 'startLongitude'> | null,
): boolean =>
  !!session?.startLatitude && !!session?.startLongitude

/** Details-form fields only; excludes profile skill/board copied at live start. */
export const liveSessionHasSavedEndDetails = (
  session: SurfSessionListItem,
): boolean =>
  !!session.waveSize ||
  !!session.crowdLevel ||
  !!session.waveFace ||
  session.sessionRating != null ||
  !!session.sessionNotes && !!session.sessionNotes.trim() ||
  !!session.swellDirection && !!session.swellDirection ||
  !!session.windDirection && !!session.windDirection ||
  !!session.tide

export const parseSubmittedSkillLevel = (
  submittedSkillLevel: FormDataEntryValue | null,
): SkillLevel | undefined => {
  if (typeof submittedSkillLevel !== 'string') {
    return undefined
  }

  const trimmedSkillLevel = submittedSkillLevel.trim()

  if (trimmedSkillLevel === '') {
    return undefined
  }

  return (Object.values(SkillLevel) as string[]).includes(trimmedSkillLevel)
    ? (trimmedSkillLevel as SkillLevel)
    : undefined
}

export const buildAddSurfSpotPathForUnassignedSession = (
  session: Pick<SurfSessionListItem, 'id' | 'startLatitude' | 'startLongitude'>,
): string | null => {
  if (session.startLatitude == null || session.startLongitude == null) {
    return null
  }

  const params = new URLSearchParams({
    latitude: String(session.startLatitude),
    longitude: String(session.startLongitude),
    sessionId: String(session.id),
  })

  return `/add-surf-spot?${params.toString()}`
}

export interface AddSpotSessionLinkParams {
  sessionId?: number
  anchorLatitude: number
  anchorLongitude: number
}

export const parseAddSpotSessionLinkParams = (
  formData: FormData,
): AddSpotSessionLinkParams | null => {
  const anchorLatitudeRaw = formData.get('linkSessionLatitude')?.toString().trim() ?? ''
  const anchorLongitudeRaw = formData.get('linkSessionLongitude')?.toString().trim() ?? ''
  if (anchorLatitudeRaw === '' || anchorLongitudeRaw === '') {
    return null
  }

  const anchorLatitude = Number(anchorLatitudeRaw)
  const anchorLongitude = Number(anchorLongitudeRaw)

  if (Number.isNaN(anchorLatitude) || Number.isNaN(anchorLongitude)) {
    return null
  }

  const sessionIdRaw = formData.get('linkSessionId')?.toString().trim() ?? ''
  const parsedSessionId =
    sessionIdRaw !== '' && !Number.isNaN(Number(sessionIdRaw))
      ? Number(sessionIdRaw)
      : undefined

  return {
    sessionId: parsedSessionId,
    anchorLatitude,
    anchorLongitude,
  }
}
