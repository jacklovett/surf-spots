import { createContext, ReactNode, useContext, useState } from 'react'
import {
  defaultSurfSpotFilters,
  SurfSpotFilters,
  SurfSpot,
  SurfSpotNote,
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
  notes: Map<string, SurfSpotNote | null>
  setNote: (surfSpotId: string, note: SurfSpotNote | null) => void
  getNote: (surfSpotId: string) => SurfSpotNote | null | undefined
  noteSubmissionComplete: boolean
  setNoteSubmissionComplete: (complete: boolean) => void
}

const SurfSpotsContext = createContext<SurfSpotsContextType | undefined>(
  undefined,
)

export const SurfSpotsProvider = ({ children }: SurfSpotsProviderProps) => {
  const [filters, setFilters] = useState<SurfSpotFilters>(
    defaultSurfSpotFilters,
  )
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])
  const [notes, setNotes] = useState<Map<string, SurfSpotNote | null>>(new Map())
  const [noteSubmissionComplete, setNoteSubmissionCompleteState] = useState<boolean>(false)

  const updateSurfSpot = (surfSpotId: string, updates: Partial<SurfSpot>) => {
    setSurfSpots((prev) =>
      prev.map((spot) =>
        spot.id === surfSpotId ? { ...spot, ...updates } : spot,
      ),
    )
  }

  const mergeSurfSpots = (newSurfSpots: SurfSpot[]) => {
    // Guard against null or undefined
    if (!newSurfSpots || !Array.isArray(newSurfSpots)) {
      return
    }

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

  const setNote = (surfSpotId: string, note: SurfSpotNote | null) => {
    setNotes((prev) => {
      const newMap = new Map(prev)
      newMap.set(surfSpotId, note)
      return newMap
    })
  }

  const getNote = (surfSpotId: string): SurfSpotNote | null | undefined => {
    return notes.get(surfSpotId)
  }

  const setNoteSubmissionComplete = (complete: boolean) => {
    setNoteSubmissionCompleteState(complete)
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
        notes,
        setNote,
        getNote,
        noteSubmissionComplete,
        setNoteSubmissionComplete,
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
