import { metersToFeet } from '~/utils'

export const formatSurfHeightRange = (
  preferredUnits: string,
  minSurfHeight?: number,
  maxSurfHeight?: number,
) => {
  if (!minSurfHeight && !maxSurfHeight) {
    return '-'
  }

  const convertHeight = (height: number = 0) =>
    preferredUnits === 'imperial' ? metersToFeet(height) : height

  const min = convertHeight(minSurfHeight)
  const max = maxSurfHeight ? convertHeight(maxSurfHeight) : null

  const unit = preferredUnits === 'imperial' ? 'ft' : 'm'
  const heightRange = max ? `${min}-${max}` : `+${min}`
  return `${heightRange}${unit}`
}

export const formatSeason = (seasonStart?: string, seasonEnd?: string) => {
  if (!seasonStart && !seasonEnd) return '-'
  if (seasonStart && seasonEnd) return `${seasonStart} - ${seasonEnd}`
  return seasonStart || seasonEnd || '-'
}
