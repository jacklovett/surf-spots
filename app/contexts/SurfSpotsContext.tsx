import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import {
  defaultSurfSpotFilters,
  SurfSpotFilters,
  SurfSpot,
  SurfSpotNote,
} from '~/types/surfSpots'
import { useUserContext } from './UserContext'

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
  const { user } = useUserContext()
  const [filters, setFilters] = useState<SurfSpotFilters>(
    defaultSurfSpotFilters,
  )
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])
  const [notes, setNotes] = useState<Map<string, SurfSpotNote | null>>(
    () => new Map(),
  )
  const [noteSubmissionComplete, setNoteSubmissionCompleteState] =
    useState<boolean>(false)

  // Clear user-specific spot/note data on login, logout, or account switch.
  // Keeps the map shell mounted; markers refresh from the empty list + refetch.
  useEffect(() => {
    setSurfSpots([])
    setNotes(new Map())
    setNoteSubmissionCompleteState(false)
  }, [user?.id])

  const updateSurfSpot = useCallback(
    (surfSpotId: string, updates: Partial<SurfSpot>) => 
      setSurfSpots((prev) =>
        prev.map((spot) =>
          spot.id === surfSpotId ? { ...spot, ...updates } : spot,
        ),
      ),
    [],
  )

  const mergeSurfSpots = useCallback((newSurfSpots: SurfSpot[]) => {
    if (!newSurfSpots || !Array.isArray(newSurfSpots)) {
      return
    }

    setSurfSpots((prev) => {
      const existingMap = new Map(prev.map((spot) => [spot.id, spot]))
      const addedSpots = newSurfSpots.filter((spot) => !existingMap.has(spot.id))
      if (addedSpots.length === 0) return prev
      return [...prev, ...addedSpots]
    })
  }, [])

  const setNote = useCallback((surfSpotId: string, note: SurfSpotNote | null) => {
    setNotes((prev) => {
      const newMap = new Map(prev)
      newMap.set(surfSpotId, note)
      return newMap
    })
  }, [])

  const getNote = useCallback(
    (surfSpotId: string): SurfSpotNote | null | undefined => notes.get(surfSpotId),
    [notes],
  )

  const setNoteSubmissionComplete = useCallback((complete: boolean) => {
    setNoteSubmissionCompleteState(complete)
  }, [])

  const value = useMemo(
    (): SurfSpotsContextType => ({
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
    }),
    [
      filters,
      setFilters,
      surfSpots,
      setSurfSpots,
      notes,
      noteSubmissionComplete,
      updateSurfSpot,
      mergeSurfSpots,
      setNote,
      getNote,
      setNoteSubmissionComplete,
    ],
  )

  return (
    <SurfSpotsContext.Provider value={value}>
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
