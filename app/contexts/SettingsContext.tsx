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
import { useFetcher } from 'react-router'

import { parsePreferredUnits, type PreferredUnits } from '~/utils/unitUtils'
import { useUserContext } from './UserContext'
import type { UserSettings } from '~/types/user'

interface Settings {
  preferredUnits: PreferredUnits
  /** Account opt-in for nearby-travel emails (gates location POSTs). */
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
  applyServerPreferredUnits: (preferredUnits?: string | null) => void
  applyServerNearbySurfSpotsEmails: (enabled: boolean) => void
}

interface AccountSettingsLoaderData {
  settings: UserSettings | null
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
    // Account opt-in is server-sourced only. Never restore from localStorage so a
    // previous user's preference cannot leak across logout/login.
    return {
      ...defaultSettings,
      preferredUnits,
      nearbySurfSpotsEmails: defaultSettings.nearbySurfSpotsEmails,
    }
  } catch (error) {
    console.error('Error parsing stored settings:', error)
    return defaultSettings
  }
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { user } = useUserContext()
  const accountSettingsFetcher = useFetcher<AccountSettingsLoaderData>()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [hasLoadedStoredSettings, setHasLoadedStoredSettings] = useState(false)
  // Child routes may apply server prefs before this provider's localStorage
  // effect runs; keep those overrides so storage load cannot clobber them.
  const serverPreferredUnitsRef = useRef<PreferredUnits | null>(null)
  const serverNearbyEmailsRef = useRef<boolean | null>(null)
  const appliedAccountSettingsForUserIdRef = useRef<string | null>(null)
  const requestedAccountSettingsForUserIdRef = useRef<string | null>(null)

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
    setHasLoadedStoredSettings(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStoredSettings) {
      return
    }
    try {
      // Persist device prefs only. nearbySurfSpotsEmails is account-scoped.
      localStorage.setItem(
        'settings',
        JSON.stringify({ preferredUnits: settings.preferredUnits }),
      )
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  }, [hasLoadedStoredSettings, settings])

  // On logout: drop account opt-in. On login: load server settings so map
  // location reporting does not wait for a visit to /settings or /profile.
  useEffect(() => {
    if (!user?.id) {
      appliedAccountSettingsForUserIdRef.current = null
      requestedAccountSettingsForUserIdRef.current = null
      serverNearbyEmailsRef.current = null
      setSettings((prev) =>
        prev.nearbySurfSpotsEmails
          ? { ...prev, nearbySurfSpotsEmails: false }
          : prev,
      )
      return
    }

    if (requestedAccountSettingsForUserIdRef.current === user.id) {
      return
    }
    requestedAccountSettingsForUserIdRef.current = user.id
    accountSettingsFetcher.load('/resources/account-settings')
    // fetcher.load identity is unstable; gate with requestedAccountSettingsForUserIdRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on auth change
  }, [user?.id])

  useEffect(() => {
    if (!user?.id || accountSettingsFetcher.state !== 'idle') {
      return
    }
    const serverSettings = accountSettingsFetcher.data?.settings
    if (serverSettings == null) {
      return
    }
    if (appliedAccountSettingsForUserIdRef.current === user.id) {
      return
    }
    appliedAccountSettingsForUserIdRef.current = user.id

    const preferredUnits = parsePreferredUnits(serverSettings.preferredUnits)
    if (preferredUnits != null) {
      serverPreferredUnitsRef.current = preferredUnits
    }
    serverNearbyEmailsRef.current = serverSettings.nearbySurfSpotsEmails

    setSettings((prev) => ({
      ...prev,
      ...(preferredUnits != null ? { preferredUnits } : {}),
      nearbySurfSpotsEmails: serverSettings.nearbySurfSpotsEmails,
    }))
  }, [user?.id, accountSettingsFetcher.state, accountSettingsFetcher.data])

  const updateSetting = useCallback(
    (key: keyof Settings, value: SettingsValue) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const applyServerPreferredUnits = useCallback(
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

  const applyServerNearbySurfSpotsEmails = useCallback((enabled: boolean) => {
    serverNearbyEmailsRef.current = enabled
    setSettings((prev) =>
      prev.nearbySurfSpotsEmails === enabled
        ? prev
        : { ...prev, nearbySurfSpotsEmails: enabled },
    )
  }, [])

  const value = useMemo(
    (): SettingsContextValue => ({
      settings,
      updateSetting,
      applyServerPreferredUnits,
      applyServerNearbySurfSpotsEmails,
    }),
    [
      settings,
      updateSetting,
      applyServerPreferredUnits,
      applyServerNearbySurfSpotsEmails,
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
