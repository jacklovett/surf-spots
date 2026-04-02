import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from 'react'
import { Trip } from '~/types/trip'

interface TripContextType {
  trips: Trip[]
  /** Replace the in-memory trip list (e.g. from a loader or resource route). */
  hydrateTrips: (next: Trip[]) => void
  /** Update one trip immutably (e.g. optimistic add/remove spot on a trip). */
  updateTripLocal: (tripId: string, updater: (trip: Trip) => Trip) => void
}

const TripContext = createContext<TripContextType | undefined>(undefined)

interface TripProviderProps {
  children: ReactNode
}

export const TripProvider = ({ children }: TripProviderProps) => {
  const [trips, setTrips] = useState<Trip[]>([])

  const hydrateTrips = useCallback((next: Trip[]) => {
    setTrips(next)
  }, [])

  const updateTripLocal = useCallback(
    (tripId: string, updater: (trip: Trip) => Trip) => {
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? updater(t) : t)),
      )
    },
    [],
  )

  const value: TripContextType = {
    trips,
    hydrateTrips,
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
