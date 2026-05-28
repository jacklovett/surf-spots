import {
  CrowdLevel,
  SurfSessionSummary,
} from '~/types/surfSpots'

const CROWD_INSIGHT_LINES: Record<CrowdLevel, string> = {
  [CrowdLevel.EMPTY]: 'Lineups are usually quiet here',
  [CrowdLevel.FEW]: 'Usually just a small group out',
  [CrowdLevel.BUSY]: 'Lineups are usually competitive',
  [CrowdLevel.PACKED]: 'Lineups are usually overcrowded',
}

export const dominantDistributionKey = (
  distribution: Record<string, number>,
): string | null => {
  const entries = Object.entries(distribution).filter(([, count]) => count > 0)
  if (entries.length === 0) {
    return null
  }
  return entries.reduce((bestEntry, entry) =>
    entry[1] > bestEntry[1] ? entry : bestEntry,
  )[0]
}

export const distributionTotal = (distribution: Record<string, number>): number =>
  Object.values(distribution).reduce((sum, count) => sum + count, 0)

export const dominantCrowdLevel = (
  distribution: Record<string, number>,
): CrowdLevel | null => {
  const topKey = dominantDistributionKey(distribution)
  if (topKey == null) {
    return null
  }
  return Object.values(CrowdLevel).includes(topKey as CrowdLevel)
    ? (topKey as CrowdLevel)
    : null
}

export const buildSessionRatingInsightLine = (
  distribution: Record<string, number>,
): string | null => {
  const total = distributionTotal(distribution)
  if (total <= 0) {
    return null
  }

  let weightedSum = 0
  for (const [ratingKey, count] of Object.entries(distribution)) {
    weightedSum += Number(ratingKey) * count
  }
  const averageRating = weightedSum / total

  if (averageRating >= 4.25) {
    return 'Sessions here are rated highly'
  }
  if (averageRating >= 3.25) {
    return 'Sessions here are generally well rated'
  }
  if (averageRating >= 2.25) {
    return 'Mixed ratings from sessions here'
  }
  return 'Sessions here are often rated low'
}

export const buildSpotRatingInsightLines = (
  summary: SurfSessionSummary,
): string[] => {
  const lines: string[] = []
  const ratingLine = buildSessionRatingInsightLine(summary.sessionRatingDistribution)
  const dominantCrowd = dominantCrowdLevel(summary.crowdDistribution)

  if (ratingLine != null) {
    lines.push(ratingLine)
  }
  if (dominantCrowd != null) {
    lines.push(CROWD_INSIGHT_LINES[dominantCrowd])
  }

  return lines
}

export const buildSpotRatingsFootnote = (summary: SurfSessionSummary): string => {
  const { sampleSize, skillLevel, fallbackToAllSkills } = summary
  const ratingWord = sampleSize === 1 ? 'rating' : 'ratings'

  if (skillLevel && !fallbackToAllSkills) {
    return `For ${skillLevel.toLowerCase()} surfers · ${sampleSize} ${ratingWord}`
  }

  return `${sampleSize} ${ratingWord}`
}

export const hasSpotRatingInsights = (summary: SurfSessionSummary): boolean =>
  summary.sampleSize > 0 && buildSpotRatingInsightLines(summary).length > 0
