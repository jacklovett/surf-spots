import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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

interface SettingsContextValue {
  settings: Settings
  updateSetting: (key: string, value: string | units) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
)

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

  const value = useMemo(
    (): SettingsContextValue => ({ settings, updateSetting }),
    [settings, updateSetting],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = () => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error(
      'useSettingsContext must be used within a SettingsProvider',
    )
  }

  return context
}
