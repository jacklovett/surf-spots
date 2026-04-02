import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'

export type DrawerPosition = 'left' | 'right'

interface DrawerState {
  isOpen: boolean
  position: DrawerPosition
  content: ReactNode | null
  title?: string
  actions?: ReactNode
}

interface LayoutContextType {
  drawer: DrawerState
  openDrawer: (
    content: ReactNode,
    position?: DrawerPosition,
    title?: string,
    actions?: ReactNode,
  ) => void
  closeDrawer: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const [drawer, setDrawer] = useState<DrawerState>({
    isOpen: false,
    position: 'right',
    content: null,
  })

  const openDrawer = useCallback(
    (
      content: ReactNode,
      position: DrawerPosition = 'right',
      title?: string,
      actions?: ReactNode,
    ) => 
      setDrawer({
        isOpen: true,
        position,
        content,
        title,
        actions,
      }),
    [],
  )

  const closeDrawer = useCallback(() =>
    setDrawer((prev) => ({
      ...prev,
      isOpen: false,
    })), [])

  const value = useMemo(
    (): LayoutContextType => ({
      drawer,
      openDrawer,
      closeDrawer,
    }),
    [drawer, openDrawer, closeDrawer],
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider')
  }
  return context
}
