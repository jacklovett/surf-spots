import { createContext, useContext, ReactNode } from 'react'
import { User } from '~/types/user'

interface UserProviderProps {
  user: User | null
  children: ReactNode
}

interface UserContextType {
  user: User | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ user, children }: UserProviderProps) => (
  <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
)

export const useUserContext = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }

  return context
}
