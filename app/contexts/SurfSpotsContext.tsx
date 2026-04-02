import {
  createContext,
  ReactNode,
  useContext,
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
  const [notes, setNotes] = useState<Map<string, SurfSpotNote | null>>(
    () => new Map(),
  )
  const [noteSubmissionComplete, setNoteSubmissionCompleteState] =
    useState<boolean>(false)

  const updateSurfSpot = useCallback(
    (surfSpotId: string, updates: Partial<SurfSpot>) => {
      setSurfSpots((prev) =>
        prev.map((spot) =>
          spot.id === surfSpotId ? { ...spot, ...updates } : spot,
        ),
      )
    },
    [],
  )

  const mergeSurfSpots = useCallback((newSurfSpots: SurfSpot[]) => {
    if (!newSurfSpots || !Array.isArray(newSurfSpots)) {
      return
    }

    setSurfSpots((prev) => {
      const existingMap = new Map(prev.map((spot) => [spot.id, spot]))
      const merged = [...prev]
      newSurfSpots.forEach((newSpot) => {
        if (!existingMap.has(newSpot.id)) {
          merged.push(newSpot)
        }
      })
      return merged
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
