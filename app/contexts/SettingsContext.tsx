import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react'

import { parsePreferredUnits, type PreferredUnits } from '~/utils/unitUtils'

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
  /** Server preference wins for signed-in users (cross-device). */
  hydratePreferredUnitsFromServer: (preferredUnits?: string | null) => void
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
    const preferredUnits =
      parsePreferredUnits(parsed.preferredUnits) ?? defaultSettings.preferredUnits
    return {
      ...defaultSettings,
      ...parsed,
      preferredUnits,
    }
  } catch (error) {
    console.error('Error parsing stored settings:', error)
    return defaultSettings
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [hasHydrated, setHasHydrated] = useState(false)
  // Child routes may hydrate server units before this provider's localStorage
  // effect runs; keep that override so storage load cannot clobber it.
  const serverPreferredUnitsRef = useRef<PreferredUnits | null>(null)

  useEffect(() => {
    const stored = readStoredSettings()
    setSettings(
      serverPreferredUnitsRef.current != null
        ? { ...stored, preferredUnits: serverPreferredUnitsRef.current }
        : stored,
    )
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

  const hydratePreferredUnitsFromServer = useCallback(
    (preferredUnits?: string | null) => {
      const parsed = parsePreferredUnits(preferredUnits)
      if (parsed == null) {
        return
      }
      serverPreferredUnitsRef.current = parsed
      setSettings((prev) =>
        prev.preferredUnits === parsed
          ? prev
          : { ...prev, preferredUnits: parsed },
      )
    },
    [],
  )

  const value = useMemo(
    (): SettingsContextValue => ({
      settings,
      updateSetting,
      hydratePreferredUnitsFromServer,
    }),
    [settings, updateSetting, hydratePreferredUnitsFromServer],
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
