import { createContext, ReactNode, useContext, useState } from 'react'
import { defaultSurfSpotFilters, SurfSpotFilters } from '~/types/surfSpots'

interface SurfSpotsProviderProps {
  children: ReactNode
}

interface SurfSpotsContextType {
  filters: SurfSpotFilters
  setFilters: (filters: SurfSpotFilters) => void
}

const SurfSpotsContext = createContext<SurfSpotsContextType | undefined>(
  undefined,
)

export const SurfSpotsProvider = ({ children }: SurfSpotsProviderProps) => {
  const [filters, setFilters] = useState<SurfSpotFilters>(
    defaultSurfSpotFilters,
  )
  return (
    <SurfSpotsContext.Provider value={{ filters, setFilters }}>
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
