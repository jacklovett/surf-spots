/**
 * Coordinate precision: 7 decimal places (~1.1 cm).
 * Used for longitude/latitude so storage and region lookups stay consistent.
 */
export const COORDINATE_DECIMAL_PLACES = 7

/**
 * Round a coordinate (longitude or latitude) to the app's standard precision.
 */
export const roundCoordinate = (value: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value
  const factor = 10 ** COORDINATE_DECIMAL_PLACES
  return Math.round(value * factor) / factor
}
