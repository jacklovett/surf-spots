import { createContext, useContext, useState, ReactNode } from 'react'

export type DrawerPosition = 'left' | 'right'

interface DrawerState {
  isOpen: boolean
  position: DrawerPosition
  content: ReactNode | null
  title?: string
}

interface LayoutContextType {
  drawer: DrawerState
  openDrawer: (
    content: ReactNode,
    position?: DrawerPosition,
    title?: string,
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

  const openDrawer = (
    content: ReactNode,
    position: DrawerPosition = 'right',
    title?: string,
  ) => {
    setDrawer({
      isOpen: true,
      position,
      content,
      title,
    })
  }

  const closeDrawer = () => {
    setDrawer((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const value: LayoutContextType = {
    drawer,
    openDrawer,
    closeDrawer,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
