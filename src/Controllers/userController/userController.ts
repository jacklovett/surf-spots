import { deleteData, edit, get, post } from '../networkController'
import { AuthRequest, User, usersEndpoint } from './index'

export const authUser = async (authRequest: AuthRequest): Promise<boolean> => {
  try {
    const response = await post(`${usersEndpoint}/auth`, authRequest)

    if (response) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error authenticating user:', error)
    return false
  }
}

export const logoutUser = async (userId: string): Promise<boolean> => {
  try {
    const response = await post(`${usersEndpoint}/logout`, userId)

    if (response) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error logging out user:', error)
    return false
  }
}

export const getUser = async (): Promise<User | null> => {
  try {
    const userProfile = await get<User>(`${usersEndpoint}/profile`)
    return userProfile
  } catch (error) {
    console.error('Error fetching surf spot by ID:', error)
    return null
  }
}

export const updateUser = async (updatedUser: User): Promise<boolean> => {
  try {
    await edit(`${usersEndpoint}/profile`, updatedUser)
    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

export const deleteUser = async (): Promise<boolean> => {
  try {
    await deleteData(`${usersEndpoint}/profile`)
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}
