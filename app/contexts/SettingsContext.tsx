import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export type units = 'metric' | 'imperial'

interface Settings {
  preferredUnits: units
}

interface SettingsProviderProps {
  children: ReactNode
}

const defaultSettings: Settings = {
  preferredUnits: 'metric',
}

const SettingsContext = createContext<{
  settings: Settings
  updateSetting: (key: string, value: string | units) => void
}>({
  settings: defaultSettings,
  updateSetting: () => {},
})

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const storedSettings = window.localStorage.getItem('settings')

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      window.localStorage.setItem('settings', JSON.stringify(settings))
    }
  }, [settings, isClient])

  const updateSetting = (key: string, value: string | units) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = () => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }

  return context
}
