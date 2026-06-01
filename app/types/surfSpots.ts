import { UrlLinkItem } from '~/components/UrlLinkList'
import { Option } from '~/components/FormInput'

export interface Coordinates {
  longitude: number
  latitude: number
}

export interface BoundingBox {
  minLongitude: number
  minLatitude: number
  maxLongitude: number
  maxLatitude: number
}

export type Continents =
  | 'Africa'
  | 'Asia'
  | 'Oceania'
  | 'Europe'
  | 'North America'
  | 'South America'

export interface Continent {
  id: string
  name: string
  slug: string
  description: string
}

export interface EmergencyNumber {
  id?: number
  label: string
  number: string
}

export interface Country {
  id: string
  name: string
  slug: string
  description: string
  regions: []
  continent?: Continent
  emergencyNumbers?: EmergencyNumber[]
}

export interface MapboxReverseGeocodeResult {
  country: string
  continent?: string
}

export interface RegionCountryLookupResponse {
  region: Region | null
  country: Country | null
  continent?: Continent | null
}

export interface Region {
  id: string
  name: string
  slug: string
  description: string
  surfSpots: []
  subRegions: SubRegion[]
}

export interface SubRegion {
  id: string
  name: string
  slug: string
  description: string
  surfSpots: []
}

export enum SurfSpotStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  PRIVATE = 'Private',
}

export enum SurfSpotType {
  BEACH_BREAK = 'Beach Break',
  REEF_BREAK = 'Reef Break',
  POINT_BREAK = 'Point Break',
  STANDING_WAVE = 'Standing Wave',
}

export enum BeachBottomType {
  SAND = 'Sand',
  ROCK = 'Rock',
  REEF = 'Reef',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  BEGINNER_INTERMEDIATE = 'Beginner - Intermediate',
  INTERMEDIATE = 'Intermediate',
  INTERMEDIATE_ADVANCED = 'Intermediate - Advanced',
  ADVANCED = 'Advanced',
  ALL_LEVELS = 'All Levels',
}

export enum EmergencyContactRelationship {
  PARENT = 'Parent',
  SPOUSE = 'Spouse',
  PARTNER = 'Partner',
  SIBLING = 'Sibling',
  CHILD = 'Child',
  FRIEND = 'Friend',
  OTHER = 'Other',
}

export enum Tide {
  ANY = 'Any',
  LOW = 'Low',
  LOW_MID = 'Low - Mid',
  MID = 'Mid',
  MID_HIGH = 'Mid - High',
  HIGH = 'High',
}

export enum WaveDirection {
  LEFT = 'Left',
  RIGHT = 'Right',
  LEFT_AND_RIGHT = 'Left and Right',
}

export enum WaveSize {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  BIG = 'Big',
}

/** Surf session log and surf spot typical crowd (API enum names). */
export enum SurfSessionWaveSize {
  SMALL = 'SMALL',
  CHEST_SHOULDER = 'CHEST_SHOULDER',
  HEAD_PLUS = 'HEAD_PLUS',
  GIANT = 'GIANT',
}

/**
 * Crowd / lineup scale: surf sessions and surf spot typical crowd.
 * Uses raw API enum names (no @JsonValue on the API side), so the crowd distribution
 * map keys ("EMPTY", "BUSY" etc.) match these values directly.
 */
export enum CrowdLevel {
  EMPTY = 'EMPTY',
  FEW = 'FEW',
  BUSY = 'BUSY',
  PACKED = 'PACKED',
}

/** Wave surface feel on a session log (values match API @JsonValue display names). */
export enum WaveFace {
  CLEAN = 'Clean',
  MUSHY = 'Mushy',
  CHOPPY = 'Choppy',
  BLOWN_OUT = 'Blown out',
}

/** External integration for session sync idempotency (matches API enum names). */
export enum ExternalSessionProvider {
  SURFLINE = 'SURFLINE',
  GARMIN = 'GARMIN',
  RIP_CURL_SEARCH_GPS3 = 'RIP_CURL_SEARCH_GPS3',
}

/** Human-readable names for session log UI (wire values remain ExternalSessionProvider enum strings). */
export const EXTERNAL_SESSION_PROVIDER_LABELS: Record<
  ExternalSessionProvider,
  string
> = {
  [ExternalSessionProvider.SURFLINE]: 'Surfline',
  [ExternalSessionProvider.GARMIN]: 'Garmin',
  [ExternalSessionProvider.RIP_CURL_SEARCH_GPS3]: 'Rip Curl Search GPS3',
}

/** Display strings for session log dropdowns (wire values stay the enum strings above). */
export const SURF_SESSION_WAVE_SIZE_LABELS: Record<SurfSessionWaveSize, string> = {
  [SurfSessionWaveSize.SMALL]: 'Waist high or smaller',
  [SurfSessionWaveSize.CHEST_SHOULDER]: 'Chest to shoulder high',
  [SurfSessionWaveSize.HEAD_PLUS]: 'Head high to overhead',
  [SurfSessionWaveSize.GIANT]: 'Giant (double overhead or larger)',
}

export const CROWD_LEVEL_LABELS: Record<CrowdLevel, string> = {
  [CrowdLevel.EMPTY]: 'Empty or near-empty lineup',
  [CrowdLevel.FEW]: 'A few people out, easy to get waves',
  [CrowdLevel.BUSY]: 'Busy lineup, competing for waves',
  [CrowdLevel.PACKED]: 'Crowded, hard to get waves',
}

export const WAVE_FACE_LABELS: Record<WaveFace, string> = {
  [WaveFace.CLEAN]: 'Clean / glassy',
  [WaveFace.MUSHY]: 'Mushy / soft',
  [WaveFace.CHOPPY]: 'Choppy / bumpy',
  [WaveFace.BLOWN_OUT]: 'Blown out / messy',
}

export const SURF_SESSION_RATING_LABELS: Record<number, string> = {
  1: 'Not worth it',
  2: 'Meh',
  3: 'Solid',
  4: 'Really good',
  5: 'All-timer',
}


export enum Direction {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
}

export interface SurfSpot extends NewSurfSpot {
  id: string
  path: string
  isSurfedSpot: boolean
  isWatched: boolean
  createdBy: string
}

export interface SwellSeason {
  id?: number
  name: string
  startMonth: string
  endMonth: string
}

export interface NewSurfSpot extends Coordinates {
  slug: string
  name: string
  description: string
  isPrivate: boolean
  status: SurfSpotStatus
  country?: Country
  region?: Region
  continent?: Continent
  type: SurfSpotType
  beachBottomType: BeachBottomType
  swellDirection: Direction
  windDirection: Direction
  tide: Tide
  waveDirection: WaveDirection
  /** Typical lineup; API enum string (EMPTY, FEW, BUSY, PACKED) or omitted. */
  crowdLevel?: CrowdLevel | null
  minSurfHeight: number
  maxSurfHeight: number
  swellSeason?: SwellSeason
  skillLevel: SkillLevel
  boatRequired: boolean
  isWavepool: boolean
  wavepoolUrl?: string
  isRiverWave: boolean
  parking: string
  foodNearby: boolean
  foodOptions: string[]
  accommodationNearby: boolean
  accommodationOptions: string[]
  facilities: string[]
  hazards: string[]
  forecasts: string[]
  webcams: string[]
}

export interface SurfSpotFormState {
  continent: string
  country: string
  region: string
  name: string
  type?: SurfSpotType
  beachBottomType?: BeachBottomType
  description: string
  longitude?: number
  latitude?: number
  swellDirection: string
  windDirection: string
  tide?: Tide
  waveDirection?: WaveDirection
  minSurfHeight?: number
  maxSurfHeight?: number
  parking: string
  foodNearby: boolean
  skillLevel?: SkillLevel
  /** Typical crowd; API enum string or empty when unset. */
  crowdLevel?: string
  forecastLinks: UrlLinkItem[]
  webcamLinks: UrlLinkItem[]
  wavepoolUrl?: string
}

export interface SurfSpotFilters {
  skillLevel: string[]
  breakType: string[]
  beachBottom: string[]
  tide: string[]
  waveDirection: string[]
  /** Typical crowd filter; API enum names (EMPTY, FEW, BUSY, PACKED). */
  crowdLevel: string[]
  swellDirection: string[]
  windDirection: string[]
  parking: Option[]
  foodOptions: Option[]
  accommodationOptions: Option[]
  hazards: Option[]
  facilities: Option[]
  seasons: string[] // Array of month names (e.g., "January", "February", etc.)
  isWavepool?: boolean
  isRiverWave?: boolean
}

export const defaultSurfSpotFilters: SurfSpotFilters = {
  skillLevel: [],
  breakType: [],
  beachBottom: [],
  tide: [],
  waveDirection: [],
  crowdLevel: [],
  swellDirection: [],
  windDirection: [],
  parking: [],
  foodOptions: [],
  accommodationOptions: [],
  hazards: [],
  facilities: [],
  seasons: [],
  isWavepool: undefined,
  isRiverWave: undefined,
}

export interface SurfSpotNote {
  id?: number
  noteText: string
  preferredTide?: Tide | null
  preferredSwellDirection?: string | null
  preferredWind?: string | null
  preferredSwellRange?: string | null
  skillRequirement?: SkillLevel | null
  surfSpotId?: number
}

export interface SurfSessionSummary {
  skillLevel?: SkillLevel
  sampleSize: number
  waveSizeDistribution: Record<string, number>
  crowdDistribution: Record<string, number>
  sessionRatingDistribution: Record<string, number>
  fallbackToAllSkills: boolean
}

export interface SurfSessionMedia {
  id: string
  surfSessionId: number
  originalUrl: string
  thumbUrl?: string
  mediaType?: string
  createdAt: string
}

export interface CreateSurfSessionMediaRequest {
  mediaId?: string
  originalUrl: string
  thumbUrl?: string
  mediaType?: string
}

export interface SurfSessionListItem {
  id: number
  sessionDate: string
  /** When start and end exist, server-derived minutes for partners and display fallbacks. */
  durationMinutes?: number | null
  /** ISO local time from API, e.g. "09:30:00". */
  sessionStartTime?: string | null
  sessionEndTime?: string | null
  /** ISO-8601 UTC instants when stored (wearables / partner sync). */
  sessionStartInstant?: string | null
  sessionEndInstant?: string | null
  /** Integration source when synced; pairs with externalSessionId. */
  externalSessionProvider?: ExternalSessionProvider | null
  /** Provider-local id when synced. */
  externalSessionId?: string | null
  createdAt: string
  surfSpotId: number
  surfSpotName: string
  spotPath: string
  waveSize?: SurfSessionWaveSize | null
  crowdLevel?: CrowdLevel | null
  waveFace?: WaveFace | null
  sessionRating?: number | null
  skillLevel?: SkillLevel
  surfboardId?: string | null
  surfboardName?: string | null
  swellDirection?: string | null
  windDirection?: string | null
  tide?: Tide | null
  sessionNotes?: string | null
  media?: SurfSessionMedia[]
}

/** GET /surf-sessions (authenticated user): headline stats plus session list. */
export interface UserSurfSessions {
  totalSessions: number
  spotsSurfedCount: number
  boardsUsedCount: number
  sessions: SurfSessionListItem[]
}
