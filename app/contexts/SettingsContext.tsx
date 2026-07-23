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
  /** Client cache of the nearby-travel email opt-in (gates location POSTs). */
  nearbySurfSpotsEmails: boolean
}

interface SettingsProviderProps {
  children: ReactNode
}

const defaultSettings: Settings = {
  preferredUnits: 'metric',
  nearbySurfSpotsEmails: false,
}

type SettingsValue = Settings[keyof Settings]

interface SettingsContextValue {
  settings: Settings
  updateSetting: (key: keyof Settings, value: SettingsValue) => void
  /** Server preference wins for signed-in users (cross-device). */
  hydratePreferredUnitsFromServer: (preferredUnits?: string | null) => void
  hydrateNearbySurfSpotsEmailsFromServer: (enabled: boolean) => void
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
    const nearbySurfSpotsEmails =
      typeof parsed.nearbySurfSpotsEmails === 'boolean'
        ? parsed.nearbySurfSpotsEmails
        : defaultSettings.nearbySurfSpotsEmails
    return {
      ...defaultSettings,
      ...parsed,
      preferredUnits,
      nearbySurfSpotsEmails,
    }
  } catch (error) {
    console.error('Error parsing stored settings:', error)
    return defaultSettings
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [hasHydrated, setHasHydrated] = useState(false)
  // Child routes may hydrate server prefs before this provider's localStorage
  // effect runs; keep those overrides so storage load cannot clobber them.
  const serverPreferredUnitsRef = useRef<PreferredUnits | null>(null)
  const serverNearbyEmailsRef = useRef<boolean | null>(null)

  useEffect(() => {
    const stored = readStoredSettings()
    setSettings({
      ...stored,
      ...(serverPreferredUnitsRef.current != null
        ? { preferredUnits: serverPreferredUnitsRef.current }
        : {}),
      ...(serverNearbyEmailsRef.current != null
        ? { nearbySurfSpotsEmails: serverNearbyEmailsRef.current }
        : {}),
    })
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
    (key: keyof Settings, value: SettingsValue) =>
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

  const hydrateNearbySurfSpotsEmailsFromServer = useCallback(
    (enabled: boolean) => {
      serverNearbyEmailsRef.current = enabled
      setSettings((prev) =>
        prev.nearbySurfSpotsEmails === enabled
          ? prev
          : { ...prev, nearbySurfSpotsEmails: enabled },
      )
    },
    [],
  )

  const value = useMemo(
    (): SettingsContextValue => ({
      settings,
      updateSetting,
      hydratePreferredUnitsFromServer,
      hydrateNearbySurfSpotsEmailsFromServer,
    }),
    [
      settings,
      updateSetting,
      hydratePreferredUnitsFromServer,
      hydrateNearbySurfSpotsEmailsFromServer,
    ],
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
