import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

  useEffect(() => {
    const storedSettings = localStorage.getItem('settings')

    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings))
      } catch (error) {
        console.error('Error parsing stored settings:', error)
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  }, [settings])

  const updateSetting = useCallback(
    (key: string, value: string | units) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  )

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
