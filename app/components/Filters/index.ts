import { Filters } from './Filters'
import { Option } from './../FormInput/index'

export interface FilterState {
  skillLevel: string[]
  breakType: string[]
  beachBottom: string[]
  tide: string[]
  rating: number
  parking: Option[]
  foodNearby: Option[]
  accommodationNearby: Option[]
  hazards: Option[]
  facilities: Option[]
}

export default Filters
