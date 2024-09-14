import { Dispatch } from '@reduxjs/toolkit'

import {
  User,
  getUser,
  updateUser,
  deleteUser,
} from '../../Controllers/userController'
import {
  deleteUserFailure,
  deleteUserSuccess,
  editUserFailure,
  editUserSuccess,
  fetchUserFailure,
  fetchUserRequest,
  fetchUserSuccess,
} from '../../Store/user/userSlice'

export const fetchUserProfile = () => async (dispatch: Dispatch) => {
  dispatch(fetchUserRequest())

  try {
    const user = await getUser()
    if (user) {
      dispatch(fetchUserSuccess(user))
    }
  } catch (error) {
    dispatch(
      fetchUserFailure(
        error instanceof Error ? error.message : 'Failed to fetch user profile',
      ),
    )
  }
}

// Edit an existing user profile
export const editUser = (updatedUser: User) => async (dispatch: Dispatch) => {
  try {
    const response = await updateUser(updatedUser)
    if (response) {
      dispatch(editUserSuccess(updatedUser)) // No fetch request needed here either
    }
  } catch (error) {
    dispatch(
      editUserFailure(
        error instanceof Error
          ? error.message
          : `Failed to update user profile`,
      ),
    )
  }
}

// Delete a surf spot
export const deleteUserProfile = () => async (dispatch: Dispatch) => {
  try {
    await deleteUser()
    dispatch(deleteUserSuccess()) // Only dispatch the success action
  } catch (error) {
    dispatch(
      deleteUserFailure(
        error instanceof Error
          ? error.message
          : `Failed to delete user profile`,
      ),
    )
  }
}
