import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ActionFunction,
  data,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'

import {
  Page,
  FormInput,
  CheckboxOption,
  ContentStatus,
  Loading,
  FormComponent,
} from '~/components'
import { SelectOption } from '~/components/FormInput'
import { useSettingsContext, useUserContext } from '~/contexts'
import { units } from '~/contexts/SettingsContext'
import {
  ERROR_UPDATE_SETTINGS,
  SUCCESS_SETTINGS_UPDATED,
} from '~/utils/errorUtils'
import { edit } from '~/services/networkService'
import {
  requireSessionCookie,
  requireFullUserProfile,
} from '~/services/session.server'
import { useSubmitStatus } from '~/hooks'
import type { UserSettings } from '~/types/user'

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Settings' },
  { name: 'description', content: 'Your preferences and notifications' },
]

const unitOptions: SelectOption[] = [
  { key: 'metric', label: 'Metric (km/m)', value: 'metric' },
  { key: 'imperial', label: 'Imperial (mi/ft)', value: 'imperial' },
]

interface LoaderData {
  settings: UserSettings | null
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const profile = await requireFullUserProfile(request)
    return data<LoaderData>({ settings: profile.settings ?? null })
  } catch {
    return data<LoaderData>({ settings: null })
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const preferredUnits = formData.get('preferredUnits') as string

  try {
    await requireSessionCookie(request)
  } catch {
    return data(
      { submitStatus: SUCCESS_SETTINGS_UPDATED, hasError: false },
      { status: 200 },
    )
  }

  const settings = {
    newSurfSpotsEmails: formData.get('newSurfSpots') === 'on',
    nearbySurfSpotEmails: formData.get('nearbySurfSpots') === 'on',
    swellSeasonEmails: formData.get('swellSeasons') === 'on',
    eventEmails: formData.get('events') === 'on',
    promotionEmails: formData.get('promotions') === 'on',
    preferredUnits,
  }

  try {
    const cookie = request.headers.get('Cookie') ?? ''
    await edit(`user/settings`, settings, {
      headers: { Cookie: cookie },
    })

    return data(
      { submitStatus: SUCCESS_SETTINGS_UPDATED, hasError: false },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unable to update settings: ', error)
    return data(
      {
        submitStatus: ERROR_UPDATE_SETTINGS,
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function Settings() {
  const { state } = useNavigation()
  const loading = state === 'loading'
  const submitStatus = useSubmitStatus()
  const { settings, updateSetting } = useSettingsContext()
  const { user } = useUserContext()
  const { settings: serverSettings } = useLoaderData<LoaderData>()

  const [preferredUnits, setPreferredUnits] = useState<units>(
    settings.preferredUnits,
  )
  const [emailSettings, setEmailSettings] = useState({
    newSurfSpots: serverSettings?.newSurfSpotEmails ?? true,
    nearbySurfSpots: serverSettings?.nearbySurfSpotsEmails ?? true,
    swellSeasons: serverSettings?.swellSeasonEmails ?? true,
    events: serverSettings?.eventEmails ?? true,
    promotions: serverSettings?.promotionEmails ?? true,
  })

  // Track if we've already saved to avoid infinite loop
  const hasSavedRef = useRef<string | null>(null)

  // Save preferredUnits to localStorage after successful form submission
  useEffect(() => {
    if (
      submitStatus &&
      !submitStatus.isError &&
      submitStatus.message &&
      submitStatus.message !== hasSavedRef.current
    ) {
      hasSavedRef.current = submitStatus.message
      updateSetting('preferredUnits', preferredUnits)
    }
  }, [submitStatus?.message, preferredUnits, updateSetting])

  // Check if any settings have changed
  const hasChanges = useMemo(() => {
    if (preferredUnits !== settings.preferredUnits) return true
    if (!serverSettings) return false
    return (
      emailSettings.newSurfSpots !== serverSettings.newSurfSpotEmails ||
      emailSettings.nearbySurfSpots !== serverSettings.nearbySurfSpotsEmails ||
      emailSettings.swellSeasons !== serverSettings.swellSeasonEmails ||
      emailSettings.events !== serverSettings.eventEmails ||
      emailSettings.promotions !== serverSettings.promotionEmails
    )
  }, [preferredUnits, settings.preferredUnits, emailSettings, serverSettings])

  const toggleEmailSetting = (key: keyof typeof emailSettings) =>
    setEmailSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  if (loading) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <h1>Settings</h1>
        <FormComponent
          submitLabel="Save Changes"
          submitStatus={submitStatus}
          method="put"
          isDisabled={!hasChanges}
        >
          <div className="column h-full">
            <section>
              <FormInput
                field={{
                  label: 'Preferred Units',
                  name: 'preferredUnits',
                  type: 'select',
                  options: unitOptions,
                }}
                value={preferredUnits}
                onChange={(e) => setPreferredUnits(e.target.value as units)}
                showLabel={!!preferredUnits}
                disabled={loading}
              />
            </section>
            {user ? (
              <>
                <div className="mt pt">
                  <h4>Email Notifications</h4>
                </div>
                <div>
                  <p className="bold">General</p>
                  <section>
                    <CheckboxOption
                      name="newSurfSpots"
                      title="New Surf Spots"
                      description="Get notified when new spots are added to the map"
                      checked={emailSettings.newSurfSpots}
                      onChange={() => toggleEmailSetting('newSurfSpots')}
                    />
                    <CheckboxOption
                      name="nearbySurfSpots"
                      title="Nearby Surf Spots"
                      description="Get alerts about surf spots near your location when you travel."
                      checked={emailSettings.nearbySurfSpots}
                      onChange={() => toggleEmailSetting('nearbySurfSpots')}
                    />
                  </section>
                  <section>
                    <p className="bold mt">Watched Surf Spots</p>
                    <CheckboxOption
                      name="swellSeasons"
                      title="Swell Season Alerts"
                      description="Get notified when the swell season begins and ends for the surf spots you're following."
                      checked={emailSettings.swellSeasons}
                      onChange={() => toggleEmailSetting('swellSeasons')}
                    />
                    <CheckboxOption
                      name="events"
                      title="Events and Contests"
                      description="Get updates on contests and events at spots you follow."
                      checked={emailSettings.events}
                      onChange={() => toggleEmailSetting('events')}
                    />
                    <CheckboxOption
                      name="promotions"
                      title="Deals and Promotions"
                      description="Receive deals on flights, surf camps, and more for spots you follow."
                      checked={emailSettings.promotions}
                      onChange={() => toggleEmailSetting('promotions')}
                    />
                  </section>
                </div>
              </>
            ) : (
                <p>Sign in to update more preferences</p>
            )}
          </div>
        </FormComponent>
      </div>
    </Page>
  )
}
