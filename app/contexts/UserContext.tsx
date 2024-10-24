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

export const UserProvider = (props: UserProviderProps) => {
  const { user, children } = props
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
