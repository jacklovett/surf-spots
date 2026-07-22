import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'

import type { PreferredUnits } from '~/utils/unitUtils'

interface Settings {
  preferredUnits: PreferredUnits
}

interface SettingsProviderProps {
  children: ReactNode
}

const defaultSettings: Settings = {
  preferredUnits: 'metric',
}

interface SettingsContextValue {
  settings: Settings
  updateSetting: (key: string, value: string | PreferredUnits) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
)

const readStoredSettings = (): Settings => {
  try {
    const storedSettings = localStorage.getItem('settings')
    if (!storedSettings) {
      return defaultSettings
    }
    const parsed = JSON.parse(storedSettings) as Partial<Settings>
    return {
      ...defaultSettings,
      ...parsed,
      preferredUnits:
        parsed.preferredUnits === 'imperial' || parsed.preferredUnits === 'metric'
          ? parsed.preferredUnits
          : defaultSettings.preferredUnits,
    }
  } catch (error) {
    console.error('Error parsing stored settings:', error)
    return defaultSettings
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setSettings(readStoredSettings())
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }
    try {
      localStorage.setItem('settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  }, [hasHydrated, settings])

  const updateSetting = useCallback(
    (key: string, value: string | PreferredUnits) =>
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
