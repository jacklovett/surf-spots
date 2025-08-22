import { SurfSpotForm } from './SurfSpotForm'
import { Continent, SurfSpot } from '~/types/surfSpots'
import { Option } from '~/components/FormInput'

export interface LoaderData {
  continents: Continent[]
  surfSpot?: SurfSpot
  error: string
}

export /**
 * Helper function for determining the initially set options
 * Used for edit forms when we have loaded in an existing surf spot
 */
const determineInitialOptions = (
  optionTypes: Option[],
  initialOptions?: string[],
) =>
  initialOptions?.map((option: string) => {
    const foundOption = optionTypes.find((at: Option) => at.value === option)

    if (!foundOption) {
      throw new Error(`Unrecognised option: ${option}`)
    }

    return foundOption
  }) || []

export default SurfSpotForm
