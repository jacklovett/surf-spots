import {
  buildSpotRatingInsightLines,
  buildSpotRatingsFootnote,
  hasSpotRatingInsights,
} from '~/utils/spotSessionSummaryDisplay'
import { SurfSessionSummary } from '~/types/surfSpots'

interface SpotSessionInsightsProps {
  sessionSummary: SurfSessionSummary
}

export const SpotSessionInsights = ({
  sessionSummary,
}: SpotSessionInsightsProps) => {
  if (!hasSpotRatingInsights(sessionSummary)) {
    return null
  }

  const insightLines = buildSpotRatingInsightLines(sessionSummary)
  const footnote = buildSpotRatingsFootnote(sessionSummary)

  return (
    <section
      className="spot-session-insights"
      data-testid="spot-session-insights"
      aria-labelledby="spot-session-insights-heading"
    >
      <h3 id="spot-session-insights-heading">Surfers like you</h3>
      <div className="spot-session-insights-card">
        <ul className="spot-session-insights-summary">
          {insightLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="spot-session-insights-footnote font-small text-secondary">
          {footnote}
        </p>
      </div>
    </section>
  )
}
