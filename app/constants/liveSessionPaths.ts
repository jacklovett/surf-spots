export const END_LIVE_SESSION_RESOURCE_PATH = '/resources/end-live-session'

export const liveSessionDetailsPath = (sessionId: number | string): string =>
  `/end-session/${sessionId}`
