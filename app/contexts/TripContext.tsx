import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { Trip } from '~/types/trip'
import { useUserContext } from './UserContext'

interface TripContextType {
  trips: Trip[]
  /** Replace the in-memory trip list (e.g. from a loader or resource route). */
  replaceTrips: (next: Trip[]) => void
  /** Update one trip immutably (e.g. optimistic add/remove spot on a trip). */
  updateTripLocal: (tripId: string, updater: (trip: Trip) => Trip) => void
}

const TripContext = createContext<TripContextType | undefined>(undefined)

interface TripProviderProps {
  children: ReactNode
}

export const TripProvider = ({ children }: TripProviderProps) => {
  const { user } = useUserContext()
  const [trips, setTrips] = useState<Trip[]>([])

  // Clear trips on login, logout, or account switch.
  useEffect(() => {
    setTrips([])
  }, [user?.id])

  const replaceTrips = useCallback((next: Trip[]) => {
    setTrips(next)
  }, [])

  const updateTripLocal = useCallback(
    (tripId: string, updater: (trip: Trip) => Trip) => {
      setTrips((prev) =>
        prev.map((trip) => (trip.id === tripId ? updater(trip) : trip)),
      )
    },
    [],
  )

  const value: TripContextType = {
    trips,
    replaceTrips,
    updateTripLocal,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export const useTripContext = () => {
  const context = useContext(TripContext)

  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider')
  }

  return context
}
