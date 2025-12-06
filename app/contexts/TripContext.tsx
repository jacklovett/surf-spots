import { createContext, ReactNode, useContext, useState, useCallback, Dispatch, SetStateAction } from 'react'
import { Trip } from '~/types/trip'
import * as tripService from '~/services/trip'

interface TripProviderProps {
  children: ReactNode
}

interface TripContextType {
  trips: Trip[]
  setTrips: Dispatch<SetStateAction<Trip[]>>
  fetchTrips: (userId: string) => Promise<void>
  createTrip: (userId: string, trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName' | 'isOwner'>) => Promise<Trip>
  updateTrip: (tripId: string, userId: string, updates: Partial<Trip>) => Promise<Trip>
  deleteTrip: (tripId: string, userId: string) => Promise<void>
  refreshTrips: (userId: string) => Promise<void>
}

const TripContext = createContext<TripContextType | undefined>(undefined)

export const TripProvider = ({ children }: TripProviderProps) => {
  const [trips, setTrips] = useState<Trip[]>([])

  const fetchTrips = useCallback(async (userId: string) => {
    try {
      const fetchedTrips = await tripService.getTrips(userId)
      setTrips(fetchedTrips)
    } catch (error) {
      console.error('Failed to fetch trips:', error)
      setTrips([])
    }
  }, [])

  const createTrip = useCallback(async (
    userId: string,
    tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName' | 'isOwner'>
  ): Promise<Trip> => {
    const newTrip = await tripService.createTrip(userId, {
      title: tripData.title,
      description: tripData.description,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
    })
    setTrips((prev) => [...prev, newTrip])
    return newTrip
  }, [])

  const updateTrip = useCallback(async (
    tripId: string,
    userId: string,
    updates: Partial<Trip>
  ): Promise<Trip> => {
    const updatedTrip = await tripService.updateTrip(tripId, userId, {
      title: updates.title,
      description: updates.description,
      startDate: updates.startDate,
      endDate: updates.endDate,
    })
    setTrips((prev) =>
      prev.map((trip) => (trip.id === tripId ? updatedTrip : trip))
    )
    return updatedTrip
  }, [])

  const deleteTrip = useCallback(async (tripId: string, userId: string) => {
    await tripService.deleteTrip(tripId, userId)
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
  }, [])

  const refreshTrips = useCallback(async (userId: string) => {
    await fetchTrips(userId)
  }, [fetchTrips])

  return (
    <TripContext.Provider
      value={{
        trips,
        setTrips,
        fetchTrips,
        createTrip,
        updateTrip,
        deleteTrip,
        refreshTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  )
}

export const useTripContext = () => {
  const context = useContext(TripContext)

  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider')
  }

  return context
}

