/**
 * Debounce function to control excessive resize events
 * @param action - function to be performed
 * @param delay - length of time to delay function call
 * @returns void - performs given action
 */
export const debounce = (action: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => action(...args), delay)
  }
}

// TODO: Does this work?
export const getCssVariable = (variable: string) =>
  getComputedStyle(document.body).getPropertyValue(variable)

/**
 * Converts meters to feet - 1m ≈ 3.28ft
 * @param meters - distance in meters
 * @returns number - distance in feet
 */
export const metersToFeet = (meters: number): number =>
  Math.round(meters * 3.28084 * 10) / 10

/**
 * Converts km to miles - 1km ≈ 0.621371mi
 * @param km - distance in kilometers
 * @returns number - distance in miles
 */
export const kmToMiles = (km: number): number => km * 0.621371
