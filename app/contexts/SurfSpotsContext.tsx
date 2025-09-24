import { createContext, ReactNode, useContext, useState } from 'react'
import {
  defaultSurfSpotFilters,
  SurfSpotFilters,
  SurfSpot,
} from '~/types/surfSpots'

interface SurfSpotsProviderProps {
  children: ReactNode
}

interface SurfSpotsContextType {
  filters: SurfSpotFilters
  setFilters: (filters: SurfSpotFilters) => void
  surfSpots: SurfSpot[]
  setSurfSpots: (surfSpots: SurfSpot[]) => void
  updateSurfSpot: (surfSpotId: string, updates: Partial<SurfSpot>) => void
  mergeSurfSpots: (newSurfSpots: SurfSpot[]) => void
}

const SurfSpotsContext = createContext<SurfSpotsContextType | undefined>(
  undefined,
)

export const SurfSpotsProvider = ({ children }: SurfSpotsProviderProps) => {
  const [filters, setFilters] = useState<SurfSpotFilters>(
    defaultSurfSpotFilters,
  )
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])

  const updateSurfSpot = (surfSpotId: string, updates: Partial<SurfSpot>) => {
    setSurfSpots((prev) =>
      prev.map((spot) =>
        spot.id === surfSpotId ? { ...spot, ...updates } : spot,
      ),
    )
  }

  const mergeSurfSpots = (newSurfSpots: SurfSpot[]) => {
    setSurfSpots((prev) => {
      // Create a map of existing surf spots by ID for quick lookup
      const existingMap = new Map(prev.map((spot) => [spot.id, spot]))

      // Add new surf spots, but don't overwrite existing ones (preserve user actions)
      const merged = [...prev]
      newSurfSpots.forEach((newSpot) => {
        if (!existingMap.has(newSpot.id)) {
          merged.push(newSpot)
        }
      })

      return merged
    })
  }

  return (
    <SurfSpotsContext.Provider
      value={{
        filters,
        setFilters,
        surfSpots,
        setSurfSpots,
        updateSurfSpot,
        mergeSurfSpots,
      }}
    >
      {children}
    </SurfSpotsContext.Provider>
  )
}

export const useSurfSpotsContext = () => {
  const context = useContext(SurfSpotsContext)

  if (!context) {
    throw new Error(
      'useSurfSpotsContext must be used within a SurfSpotsProvider',
    )
  }

  return context
}
