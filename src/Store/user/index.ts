import { AsyncState } from '../storeUtils'
import { User } from '../../Controllers/userController'
import { fetchUserProfile } from '../../Services/userService'
import userSlice from './userSlice'

// State
export interface UserState extends AsyncState {
  user: User | null
}

// Selector
const selectUser = (state: UserState) => state.user
const selectUserAuthenticated = (state: UserState) =>
  state.user?.isAuthenticated
const selectUserLoading = (state: UserState) => state.loading
const selectUserError = (state: UserState) => state.error

export {
  fetchUserProfile,
  selectUserAuthenticated,
  selectUser,
  selectUserError,
  selectUserLoading,
  userSlice,
}
