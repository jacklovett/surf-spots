import { Dispatch } from 'redux'
import {
  getAllSurfSpots,
  getSurfSpotById,
  createSurfSpot,
  updateSurfSpot,
  deleteSurfSpot,
  NewSurfSpot,
  SurfSpot,
} from '../../Controllers/surfSpotController'
import {
  addSurfSpotSuccess,
  addSurfSpotFailure,
  deleteSurfSpotSuccess,
  editSurfSpotSuccess,
  fetchSurfSpotsFailure,
  fetchSurfSpotsRequest,
  fetchSurfSpotsSuccess,
  fetchSurfSpotSuccess,
  editSurfSpotFailure,
  deleteSurfSpotFailure,
} from '../../Store/surfSpots'

// Fetch all surf spots
export const fetchAllSurfSpots = () => async (dispatch: Dispatch) => {
  dispatch(fetchSurfSpotsRequest())

  try {
    const response = await getAllSurfSpots()
    dispatch(fetchSurfSpotsSuccess(response))
  } catch (error) {
    dispatch(
      fetchSurfSpotsFailure(
        error instanceof Error ? error.message : 'Failed to fetch surf spots',
      ),
    )
  }
}

// Fetch a surf spot by ID
export const fetchSurfSpotById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(fetchSurfSpotsRequest())

  try {
    const spot = await getSurfSpotById(id)
    if (spot) {
      dispatch(fetchSurfSpotSuccess(spot))
    }
  } catch (error) {
    dispatch(
      fetchSurfSpotsFailure(
        error instanceof Error
          ? error.message
          : `Failed to fetch surf spot with ID ${id}`,
      ),
    )
  }
}

// Add a new surf spot
export const addNewSurfSpot =
  (newSurfSpot: NewSurfSpot) => async (dispatch: Dispatch) => {
    try {
      const createdSurfSpot = await createSurfSpot(newSurfSpot)
      if (createdSurfSpot) {
        dispatch(addSurfSpotSuccess(createdSurfSpot)) // No need for fetch request action
      }
    } catch (error) {
      dispatch(
        addSurfSpotFailure(
          error instanceof Error
            ? error.message
            : 'Failed to create new surf spot',
        ),
      )
    }
  }

// Edit an existing surf spot
export const editSurfSpot =
  (id: string, updatedSpot: SurfSpot) => async (dispatch: Dispatch) => {
    try {
      const response = await updateSurfSpot(id, updatedSpot)
      if (response) {
        dispatch(editSurfSpotSuccess(updatedSpot)) // No fetch request needed here either
      }
    } catch (error) {
      dispatch(
        editSurfSpotFailure(
          error instanceof Error
            ? error.message
            : `Failed to update surf spot with ID ${id}`,
        ),
      )
    }
  }

// Delete a surf spot
export const deleteSurfSpotById =
  (id: string) => async (dispatch: Dispatch) => {
    try {
      await deleteSurfSpot(id)
      dispatch(deleteSurfSpotSuccess(id)) // Only dispatch the success action
    } catch (error) {
      dispatch(
        deleteSurfSpotFailure(
          error instanceof Error
            ? error.message
            : `Failed to delete surf spot with ID ${id}`,
        ),
      )
    }
  }
